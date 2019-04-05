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

module.exports.transactionStatuses = type.transactionStatuses
module.exports.transactionSettlementStatuses = type.transactionSettlementStatuses
module.exports.transactionEvents = type.transactionEvents
module.exports.tokenTypes = type.tokenTypes
module.exports.userTokenTypes = type.userTokenTypes
module.exports.transactionFlags = type.transactionFlags
module.exports.transactionFlows = type.transactionFlows

module.exports.errorCodes = type.errorCodes

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

module.exports.createTransaction = async (transaction) => {
  let createdTransaction = await models.transaction.create(transaction)

  if (createdTransaction) {
    return createdTransaction.toJSON()
  }
}

/**
 * Update single transaction
 */
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
        include: [ models.paymentProviderType, models.paymentProviderConfig ]
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

/**
 * Get many payment provider
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

/**
 * Emit transaction event to all handler (via nodejs event emitter).
 * It will emit event with object,
 ```js
   transactionEvent = {
    transactionId: 1,
    transaction: { ... } // complete transaction data
  }
 ```
 */
module.exports.emitTransactionEvent = (transactionEvent, transactionId, transaction = null) => {
  events.emit(transactionEvent, {
    transactionId: transactionId,
    transaction: transaction
  })
}

/**
 * Listen to transaction event (via nodejs event emitter)
 */
module.exports.addListener = (transactionEvent, callback) => {
  events.addListener(transactionEvent, callback)
}

module.exports.forceTransactionStatus = async (transactionId, transactionStatus) => {
  if (transactionStatus) {
    if (await exports.updateTransaction({ transaction_status: transactionStatus }, transactionId)) {
      let eventName = null

      if (transactionStatus === exports.transactionStatuses.SUCCESS) {
        eventName = exports.transactionEvents.SUCCESS
      }

      if (transactionStatus === exports.transactionStatuses.FAILED) {
        eventName = exports.transactionEvents.FAILED
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
 * Mother of mika system.
 * Create new transaction with specified agentId and paymentProviderId
 */
module.exports.newTransaction = async (
  amount,
  paymentProviderId,
  agentId,
  options = {}) => {
  let config = Object.assign({
    amount,
    paymentProviderId,
    agentId,
    terminalId: null,
    partnerId: null,
    flags: [],
    ipAddress: null,
    locationLong: null,
    locationLat: null,
    requirePostAction: false,
    postActionMessage: null,
    redirectTo: null,
    paymentProvider: null,
    transaction: {},
    updatedTransaction: null,
    userToken: null,
    userTokenType: null,
    token: null,
    tokenType: null
  },
  options)

  if (!Array.isArray(config.flags)) {
    config.flags = []
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
        return {
          error: exports.errorCode.AMOUNT_TOO_LOW,
          errorMinimumAmount: config.paymentProvider.minimumAmount
        }
      }
    }

    if (config.paymentProvider.maximumAmount) {
      if (config.amount > config.paymentProvider.maximumAmount) {
        return {
          error: exports.errorCode.AMOUNT_TOO_HIGH,
          errorMaximumAmount: config.paymentProvider.maximumAmount
        }
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

  if (config.redirectTo && config.paymentProvider.gateway) {
    return {
      redirectTo: config.redirectTo
    }
  }

  config.transaction = await exports.createTransaction(Object.assign(
    {
      transactionStatus: exports.transactionStatuses.CREATED,
      amount: config.amount,
      agentId: config.agentId,
      terminalId: config.terminalId,
      partnerId: config.partnerId,
      locationLat: config.locationLat,
      locationLong: config.locationLong,
      ipAddress: config.ipAddress,
      paymentProviderId: config.paymentProviderId
    },
    config.transaction
  ))

  if (!config.transaction) {
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

  let newTransaction = {
    transactionId: config.transaction.id,
    transactionStatus: config.transaction.transactionStatus
  }

  // TODO: add post action here
  if (config.requirePostAction) {
  }

  if (config.token && config.tokenType) {
    newTransaction.token = config.token
    newTransaction.tokenType = config.tokenType
  }

  if (config.transaction.transactionStatus === exports.transactionStatuses.CREATED) {
    await dTimer.postEvent({
      event: exports.transactionEvents.GLOBAL_TIMEOUT,
      transactionId: config.transaction.id,
      transaction: config.transaction
    }, exports.config.transactionTimeout)
  }

  return newTransaction
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
    if (eventObject.event === exports.transactionEvents.GLOBAL_TIMEOUT) {
      let config = {
        transaction: await exports.getTransaction(eventObject.transactionId),
        updatedTransaction: null
      }

      // transaction is already finished, do nothing
      if (
        [exports.transactionStatuses.SUCCESS, exports.transactionStatuses.FAILED]
          .includes(config.transaction.transactionStatus)
      ) {
        return true
      }

      console.log('Receive transactionTimeout event for', eventObject.transactionId)

      let ppHandler = exports.findPpHandler(config.transaction.paymentProvider.paymentProviderConfig.handler)

      // Handle transaction by each payment provider timeout handler
      if (typeof ppHandler.timeoutHandler === 'function') {
        await ppHandler.timeoutHandler(config)
      }

      config.updatedTransaction = Object.assign(
        {
          transactionStatus: exports.transactionStatuses.FAILED
        },
        config.updatedTransaction
      )

      await exports.updateTransaction(config.updatedTransaction, eventObject.transactionId)

      if (config.updatedTransaction.transaction_status_id === exports.transactionStatuses.FAILED) {
        exports.emitTransactionEvent(exports.transactionEvents.FAILED, eventObject.transactionId)
      } else if (config.updatedTransaction.transaction_status_id === exports.transactionStatuses.SUCCESS) {
        exports.emitTransactionEvent(exports.transactionEvents.SUCCESS, eventObject.transactionId)
      }

      if (typeof ppHandler.timeoutPostHandler === 'function') {
        await ppHandler.timeoutPostHandler(config)
      }

      return true
    }
  } catch (err) {
    console.log(err)
    return false
  }
})

/**
 * Emitter for SUCCESS_WITH_DATA event
 * Just listen to ordinary transaction event,
 * then emit SUCCESS_WITH_DATA event with transaction
 */
events.addListener(exports.transactionEvents.SUCCESS, async (eventObject) => {
  if (events.listenerCount(exports.transactionEvents.SUCCESS_WITH_DATA)) {
    eventObject.transaction = await exports.getTransaction(eventObject.transactionId)
    events.emit(exports.transactionEvents.SUCCESS_WITH_DATA, eventObject)
  }
})

/**
 * Emitter for FAILED_WITH_DATA event
 * Just listen to ordinary transaction event,
 * then emit FAILED_WITH_DATA event with transaction
 */
events.addListener(exports.transactionEvents.FAILED, async (eventObject) => {
  if (events.listenerCount(exports.transactionEvents.FAILED_WITH_DATA)) {
    eventObject.transaction = await exports.getTransaction(eventObject.transactionId)
    events.emit(exports.transactionEvents.FAILED_WITH_DATA, eventObject)
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
