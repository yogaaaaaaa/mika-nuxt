'use strict'

/**
 * Provide all functionality to create transaction in mika system.
 * Its also provide constant related transaction object
 *
 * Note : agent is interchangeable with terminal here
 */

const models = require('../models')

const dTimer = require('./dTimer')
const events = Object.create(require('events').prototype)

const fs = require('fs')
const path = require('path')

module.exports.config = require('../config/transactionManagerConfig')

module.exports.pgHandlers = []

module.exports.transactionStatus = {
  SUCCESS: 'success',
  FAILED: 'failed',
  VOIDED: 'voided',
  CREATED: 'created',
  EXPIRED: 'expired',
  PENDING: 'pending',
  ERROR: 'error'
}

module.exports.transactionSettlementStatus = {
  UNSETTLED: 'unsettled',
  SETTLED_IN: 'settledIn',
  SETTLED: 'settled',
  ERROR: 'error'
}

module.exports.transactionEvent = {
  CREATED: 'transactionCreated',
  CREATED_WITH_DATA: 'transactionCreatedWithData',
  SUCCESS: 'transactionSuccess',
  SUCCESS_WITH_DATA: 'transactionSuccessWithData',
  FAILED: 'transactionFailed',
  FAILED_WITH_DATA: 'transactionFailedWithData',
  EXPIRED: 'transactionExpired',
  GLOBAL_TIMEOUT: 'transactionGlobalTimeout'
}

module.exports.errorCode = {
  AMOUNT_TOO_LOW: 'amountATooLow',
  AMOUNT_TOO_HIGH: 'amountATooHigh',
  PAYMENT_GATEWAY_NOT_FOR_YOU: 'invalidPaymentGateway',
  NEED_EXTRA_CONFIG: 'extraConfigNeeded',
  NEED_USER_TOKEN: 'userTokenNeeded',
  JUST_ERROR: 'unknownError'
}

module.exports.tokenType = {
  TOKEN_QRCODE_CONTENT: 'tokenQrCodeContent',
  TOKEN_QRCODE_URL_IMAGE: 'tokenQrCodeUrlImage'
}

module.exports.userTokenType = {
  USER_TOKEN_QRCODE_CONTENT: 'userTokenQrCodeContent',
  USER_TOKEN_PIN: 'userTokenPIN',
  USER_TOKEN_EMV_MIKA: 'userTokenEmvTagsMika_57_82_95_9A_9C_5F2A_5F34_9F02_9F03_9F10_9F1A_9F26_9F27_9F33_9F34_9F35_9F36_9F37'
}

module.exports.transactionFlags = {
  NO_AMOUNT_CHECK: 'flagsNoAmountCheck'
}

module.exports.findPgHandlers = (alias) => {
  alias = alias.toLowerCase()
  alias = alias.replace(' ', '_')
  for (let pg of exports.pgHandlers) {
    for (let pgAlias of pg.alias) {
      if (pgAlias === alias) {
        return pg
      }
    }
  }
  return null
}

module.exports.updateTransactionData = async (updatedTransactionData, targetTransactionId, targetTransactionStatus = null) => {
  let setting = {
    where: { id: targetTransactionId }
  }
  if (targetTransactionStatus) {
    setting.where.transaction_status = targetTransactionStatus
  }
  return models.transaction.update(updatedTransactionData, setting)
}

// TODO: FIXME
module.exports.getTransactionData = async (transactionId) => {
  const transactionData = await models.transaction.findOne({
    where: {
      id: transactionId
    },
    include: [
      {
        model: models.terminal,
        include: [ models.user ]
      },
      { model: models.payment_gateway },
      { model: models.transaction_status }
    ]
  })

  if (transactionData) {
    return transactionData.toJSON()
  }
}

module.exports.getTransactionDataOnly = async (transactionId) => {
  const transactionData = await models.transaction.findOne({
    where: {
      id: transactionId
    }
  })

  if (transactionData) {
    return transactionData.toJSON()
  }
}

module.exports.createTransactionData = async (transactionData) => {
  return models.transaction.create(transactionData)
}

module.exports.getPaymentGatewaysDataByAgent = async (agentId, paymentGatewayId = null) => {
  let whereCondition = {
    agentId: agentId
  }

  if (paymentGatewayId) {
    whereCondition.paymentProviderId = paymentGatewayId
  }

  let paymentGatewayData = await models.agentPaymentProvider.findAll({
    where: {
      agentId: agentId,
      paymentProviderId: paymentGatewayId
    },
    attributes: ['id'],
    include: [ {
      model: models.payment_gateway,
      include: [
        { model: models.payment_gateway_type },
        { model: models.payment_gateway_config }
      ]
    }]
  })

  if (paymentGatewayData) {
    return paymentGatewayData.map((data) => data.payment_gateway.toJSON())
  }

  return []
}

module.exports.emitTransactionEvent = (transactionEvent, transactionId, transactionData = null) => {
  events.emit(transactionEvent, {
    transactionId: transactionId,
    transactionData: transactionData
  })
}

module.exports.addListener = (transactionEvent, callback) => {
  events.addListener(transactionEvent, callback)
}

module.exports.forceTransactionStatus = async (transactionId, transactionStatus) => {
  if (transactionStatus) {
    if (await exports.updateTransactionData({ transaction_status: transactionStatus }, transactionId)) {
      let eventName = null

      if (transactionStatus === exports.transactionStatus.SUCCESS) {
        eventName = exports.transactionEvent.SUCCESS
      }

      if (transactionStatus === exports.transactionStatus.FAILED) {
        eventName = exports.transactionEvent.FAILED
      }

      if (eventName) {
        exports.emitTransactionEvent(eventName, transactionId)
      }

      return true
    }
  }
  return false
}

/**
 * Mother of mika system
 * Create transaction with specified agentId and paymentGatewayId
 */
module.exports.createTransaction = async (agentId, paymentProviderId, amount, flags = '', userToken = null) => {
  try {
    let config = {
      agentId,
      paymentProviderId,
      amount,
      flags: flags.split(',').map((flag) => flag.trim()),
      transactionData: {},
      requirePostAction: null,
      redirectTo: null,
      transactionDataUpdated: null,
      userToken: userToken,
      token: null,
      tokenType: null,
      pgData: null
    }

    config.pgData = await exports.getPaymentGatewaysDataByAgent(config.agentId, config.paymentGatewayId)
    if (config.pgData.length === 0) {
      return { error: exports.errorCode.PAYMENT_GATEWAY_NOT_FOR_YOU }
    } else {
      config.pgData = config.pgData[0]
    }

    if (!config.flags.includes(exports.transactionFlags.NO_AMOUNT_CHECK)) {
      if (config.pgData.minimum_amount) {
        if (config.amount < config.pgData.minimum_amount) {
          return { error: exports.errorCode.AMOUNT_TOO_LOW, errorMinimumAmount: config.pgData.minimum_amount }
        }
      }

      if (config.pgData.maximum_amount) {
        if (config.amount > config.pgData.maximum_amount) {
          return { error: exports.errorCode.AMOUNT_TOO_HIGH, errorMaximumAmount: config.pgData.maximum_amount }
        }
      }
    }

    let pgHandlers = exports.findPgHandlers(config.pgData.name)

    if (typeof pgHandlers.preHandler === 'function') {
      let returnValue = await pgHandlers.preHandler(config)
      if (returnValue) {
        if (returnValue.error) {
          return returnValue
        }
        return { error: exports.errorCode.JUST_ERROR }
      }
    }

    if (!await exports.createTransactionData(Object.assign(
      {
        transaction_status_id: exports.transactionStatus.INQUIRY.id,
        terminalId: config.agentId,
        paymentProviderId: config.paymentGatewayId,
        amount: config.amount
      },
      config.transactionData
    ))
    ) {
      return { error: exports.errorCode.JUST_ERROR }
    }

    if (typeof pgHandlers.handler === 'function') {
      let returnValue = await pgHandlers.handler(config)
      if (returnValue) {
        if (returnValue.error) {
          return returnValue
        }
        return { error: exports.errorCode.JUST_ERROR }
      }
    }

    if (config.transactionDataUpdated) {
      await exports.updateTransactionData(config.transactionDataUpdated, config.transactionData.id)
    }

    config.transactionData = await exports.getTransactionDataOnly(config.transactionData.id)

    let createdTransaction = {
      transactionId: config.transactionData.id,
      transactionData: config.transactionData
    }

    if (config.token) {
      createdTransaction.tokenType = config.token.type
      createdTransaction.token = config.token.value
    }

    events.emit(exports.transactionEvent.CREATED, createdTransaction)

    if (config.transactionData.transaction_status_id === exports.transactionStatus.INQUIRY.id) {
      await dTimer.postEvent({
        event: exports.transactionEvent.GLOBAL_TIMEOUT,
        transactionId: config.transactionData.id,
        transactionData: config.transactionData
      }, exports.config.transactionTimeout)
    }

    return createdTransaction
  } catch (err) {
    console.log(err)
    return { error: exports.errorCode.JUST_ERROR }
  }
}

/**
 * Some payment gateway require post-transaction action, this function encapsulate
 * Call to every handler
 */
module.exports.postTransactionAction = async (agentId, paymentGatewayId) => {
}

/**
 * Handle timeout event from redis timer
 */
dTimer.handleEvent(async (eventObject) => {
  try {
    if (eventObject.event === exports.transactionEvent.GLOBAL_TIMEOUT) {
      let config = {
        databaseTransaction: null,
        transactionData: await exports.getTransactionData(eventObject.transactionId),
        transactionDataUpdated: null
      }

      // transaction is already finished, do nothing
      if (
        [exports.transactionStatus.SUCCESS.id, exports.transactionStatus.FAILED.id]
          .includes(config.transactionData.transaction_status_id)
      ) {
        return true
      }

      console.log('Receive transactionTimeout event')

      let pgHandlers = exports.findPgHandlers(config.transactionData.payment_gateway.name)

      // Handle transaction by each payment gateway timeout handler
      if (typeof pgHandlers.timeoutHandler === 'function') {
        await pgHandlers.timeoutHandler(config)
      }

      config.transactionDataUpdated = Object.assign(
        { transaction_status_id: exports.transactionStatus.FAILED.id },
        config.transactionDataUpdated
      )

      await exports.updateTransactionData(config.transactionDataUpdated, eventObject.transactionId)

      if (config.transactionDataUpdated.transaction_status_id === exports.transactionStatus.FAILED.id) {
        exports.emitTransactionEvent(exports.transactionEvent.FAILED, eventObject.transactionId)
      } else if (config.transactionDataUpdated.transaction_status_id === exports.transactionStatus.SUCCESS.id) {
        exports.emitTransactionEvent(exports.transactionEvent.SUCCESS, eventObject.transactionId)
      }

      if (typeof pgHandlers.timeoutPostHandler === 'function') {
        await pgHandlers.timeoutPostHandler(config)
      }

      return true
    }
  } catch (err) {
    return false
  }
})

/**
 * Emitter for *_WITH_DATA event
 * Just listen to ordinary transaction event,
 * then emit *_WITH_DATA event with transactionData
 */

events.addListener(exports.transactionEvent.SUCCESS, async (eventObject) => {
  if (events.listenerCount(exports.transactionEvent.SUCCESS_WITH_DATA)) {
    eventObject.transactionData = await exports.getTransactionData(eventObject.transactionId)
    events.emit(exports.transactionEvent.SUCCESS_WITH_DATA, eventObject)
  }
})

events.addListener(exports.transactionEvent.FAILED, async (eventObject) => {
  if (events.listenerCount(exports.transactionEvent.FAILED_WITH_DATA)) {
    eventObject.transactionData = await exports.getTransactionData(eventObject.transactionId)
    events.emit(exports.transactionEvent.FAILED_WITH_DATA, eventObject)
  }
})

/**
 * Add all payment gateway handler
 */
fs
  .readdirSync(path.join(__dirname, 'transactionManagerHandler'))
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    require(`./transactionManagerHandler/${file}`)(exports)
  })
