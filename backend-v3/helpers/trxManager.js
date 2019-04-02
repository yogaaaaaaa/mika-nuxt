'use strict'

/**
 * Provide all functionality to create transaction in mika system.
 * Its also provide constant related transaction object
 */

const models = require('../models')

const dTimer = require('./dTimer')
const events = Object.create(require('events').prototype)

const fs = require('fs')
const path = require('path')

const config = require('../config/trxManagerConfig')
const type = require('../config/trxManagerTypeConfig')

module.exports.config = config
module.exports.type = type

module.exports.transactionStatus = type.transactionStatus
module.exports.transactionSettlementStatus = type.transactionSettlementStatus
module.exports.transactionEvent = type.transactionEvent
module.exports.tokenType = type.tokenType
module.exports.userTokenType = type.userTokenType
module.exports.transactionFlag = type.transactionFlag
module.exports.transactionFlow = type.transactionFlow

module.exports.errorCode = type.errorCode

/**
 * Array containing payment provider handler
 */
module.exports.ppHandlers = []

/**
 * Find payment provider handler
 * based on name
 */
module.exports.findPpHandler = (name) => {
  name = name.toLowerCase()
  name = name.replace(' ', '_')
  for (let pp of exports.ppHandlers) {
    if (pp.name === name) {
      return pp
    }
  }
  return null
}

module.exports.updateTransaction = async (updatedTransaction, targetTransactionId, targetTransactionStatus = null) => {
  let setting = {
    where: { id: targetTransactionId }
  }
  if (targetTransactionStatus) {
    setting.where.transaction_status = targetTransactionStatus
  }
  return models.transaction.update(updatedTransaction, setting)
}

/**
 * Get transaction data with its related data
 */
module.exports.getTransaction = async (transactionId) => {
  const transaction = await models.transaction.findOne({
    where: {
      id: transactionId
    },
    include: [
      {
        model: models.partner
      },
      {
        model: models.agent,
        include: [ models.merchant ]
      },
      {
        model: models.terminal,
        include: [ models.terminalModel ]
      },
      {
        model: models.paymentProvider,
        include: [
          {
            models: models.paymentProviderType
          },
          {
            models: models.paymentProviderConfig,
            attributes: { exclude: ['config'] }
          }

        ]
      }
    ]
  })

  if (transaction) {
    return transaction.toJSON()
  }
}

/**
 * Get transaction data only, without its related data
 */
module.exports.getTransactionOnly = async (transactionId) => {
  const transaction = await models.transaction.findOne({
    where: {
      id: transactionId
    }
  })

  if (transaction) {
    return transaction.toJSON()
  }
}

module.exports.createTransaction = async (transaction) => {
  return models.transaction.create(transaction)
}

/**
 * Get single or many payment provider
 */
module.exports.getPaymentProvidersByAgent = async (agentId, paymentProviderId = null) => {
  let whereCondition = {
    agentId: agentId
  }

  if (paymentProviderId) {
    whereCondition.paymentProviderId = paymentProviderId
  }

  let paymentProvider = await models.agentPaymentProvider.findAll({
    where: whereCondition,
    attributes: ['id'],
    include: [ {
      model: models.paymentProvider,
      include: [
        { model: models.paymentProviderType },
        { model: models.paymentProviderConfig }
      ]
    }]
  })

  if (paymentProvider) {
    return paymentProvider.map((data) => data.paymentProvider.toJSON())
  }

  return []
}

module.exports.emitTransactionEvent = (transactionEvent, transactionId, transaction = null) => {
  events.emit(transactionEvent, {
    transactionId: transactionId,
    transaction: transaction
  })
}

module.exports.addListener = (transactionEvent, callback) => {
  events.addListener(transactionEvent, callback)
}

module.exports.forceTransactionStatus = async (transactionId, transactionStatus) => {
  if (transactionStatus) {
    if (await exports.updateTransaction({ transaction_status: transactionStatus }, transactionId)) {
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
 * Create transaction with specified agentId and paymentProviderId
 */
module.exports.createTransaction = async (agentId, paymentProviderId, amount, flags = '', userToken = null) => {
  try {
    let config = {
      agentId,
      paymentProviderId,
      amount,
      flags: flags.split(',').map((flag) => flag.trim()),
      requirePostAction: false,
      redirectTo: null,
      paymentProvider: null,
      transaction: {},
      updatedTransaction: null,
      userToken: userToken,
      token: null,
      tokenType: null
    }

    config.paymentProvider = await exports.getPaymentProvidersByAgent(config.agentId, config.paymentProviderId)
    if (config.paymentProvider.length === 0) {
      return { error: exports.errorCode.PAYMENT_PROVIDER_NOT_FOR_YOU }
    } else {
      config.paymentProvider = config.paymentProvider[0]
    }

    if (!config.flags.includes(exports.transactionFlags.NO_AMOUNT_CHECK)) {
      if (config.paymentProvider.minimumAmount) {
        if (config.amount < config.paymentProvider.minimumAmount) {
          return { error: exports.errorCode.AMOUNT_TOO_LOW, errorMinimumAmount: config.paymentProvider.minimumAmount }
        }
      }

      if (config.paymentProvider.maximumAmount) {
        if (config.amount > config.paymentProvider.maximumAmount) {
          return { error: exports.errorCode.AMOUNT_TOO_HIGH, errorMaximumAmount: config.paymentProvider.maximumAmount }
        }
      }
    }

    let ppHandler = exports.findPpHandler(config.paymentProvider.paymentProviderConfig.handler)

    if (typeof ppHandler.preHandler === 'function') {
      let returnValue = await ppHandler.preHandler(config)
      if (returnValue) {
        if (returnValue.error) {
          return returnValue
        }
        return { error: exports.errorCode.JUST_ERROR }
      }
    }

    if (!await exports.createTransaction(Object.assign(
      {
        transaction_status_id: exports.transactionStatus.INQUIRY.id,
        terminalId: config.agentId,
        paymentProviderId: config.paymentProviderId,
        amount: config.amount
      },
      config.transaction
    ))
    ) {
      return { error: exports.errorCode.JUST_ERROR }
    }

    if (typeof ppHandler.handler === 'function') {
      let returnValue = await ppHandler.handler(config)
      if (returnValue) {
        if (returnValue.error) {
          return returnValue
        }
        return { error: exports.errorCode.JUST_ERROR }
      }
    }

    if (config.updatedTransaction) {
      await exports.updateTransaction(config.updatedTransaction, config.transaction.id)
    }

    config.transaction = await exports.getTransactionOnly(config.transaction.id)

    let createdTransaction = {
      transactionId: config.transaction.id,
      transaction: config.transaction
    }

    if (config.token) {
      createdTransaction.tokenType = config.token.type
      createdTransaction.token = config.token.value
    }

    events.emit(exports.transactionEvent.CREATED, createdTransaction)

    if (config.transaction.transaction_status_id === exports.transactionStatus.INQUIRY.id) {
      await dTimer.postEvent({
        event: exports.transactionEvent.GLOBAL_TIMEOUT,
        transactionId: config.transaction.id,
        transaction: config.transaction
      }, exports.config.transactionTimeout)
    }

    return createdTransaction
  } catch (err) {
    console.log(err)
    return { error: exports.errorCode.JUST_ERROR }
  }
}

/**
 * Some payment providers require post-transaction action, this function encapsulate
 * Call to every handler
 */
module.exports.postTransactionAction = async (agentId, paymentProviderId) => {
}

/**
 * Handle timeout event from redis timer
 */
dTimer.handleEvent(async (eventObject) => {
  try {
    if (eventObject.event === exports.transactionEvent.GLOBAL_TIMEOUT) {
      let config = {
        databaseTransaction: null,
        transaction: await exports.gettransaction(eventObject.transactionId),
        updatedTransaction: null
      }

      // transaction is already finished, do nothing
      if (
        [exports.transactionStatus.SUCCESS.id, exports.transactionStatus.FAILED.id]
          .includes(config.transaction.transaction_status_id)
      ) {
        return true
      }

      console.log('Receive transactionTimeout event')

      let ppHandler = exports.findPpHandler(config.transaction.paymentProvider.paymentProviderConfig.handler)

      // Handle transaction by each payment provider timeout handler
      if (typeof ppHandler.timeoutHandler === 'function') {
        await ppHandler.timeoutHandler(config)
      }

      config.updatedTransaction = Object.assign(
        { transaction_status_id: exports.transactionStatus.FAILED.id },
        config.updatedTransaction
      )

      await exports.updateTransaction(config.updatedTransaction, eventObject.transactionId)

      if (config.updatedTransaction.transaction_status_id === exports.transactionStatus.FAILED.id) {
        exports.emitTransactionEvent(exports.transactionEvent.FAILED, eventObject.transactionId)
      } else if (config.updatedTransaction.transaction_status_id === exports.transactionStatus.SUCCESS.id) {
        exports.emitTransactionEvent(exports.transactionEvent.SUCCESS, eventObject.transactionId)
      }

      if (typeof ppHandler.timeoutPostHandler === 'function') {
        await ppHandler.timeoutPostHandler(config)
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
 * then emit *_WITH_DATA event with transaction
 */

events.addListener(exports.transactionEvent.SUCCESS, async (eventObject) => {
  if (events.listenerCount(exports.transactionEvent.SUCCESS_WITH_DATA)) {
    eventObject.transaction = await exports.gettransaction(eventObject.transactionId)
    events.emit(exports.transactionEvent.SUCCESS_WITH_DATA, eventObject)
  }
})

events.addListener(exports.transactionEvent.FAILED, async (eventObject) => {
  if (events.listenerCount(exports.transactionEvent.FAILED_WITH_DATA)) {
    eventObject.transaction = await exports.gettransaction(eventObject.transactionId)
    events.emit(exports.transactionEvent.FAILED_WITH_DATA, eventObject)
  }
})

/**
 * Add all payment gateway handler
 */
fs
  .readdirSync(path.join(__dirname, config.handlerDir))
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    require(path.join(__dirname, config.handlerDir, file))(exports)
  })
