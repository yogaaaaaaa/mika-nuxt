'use strict'

/**
 * Provide all functionality to create transaction in mika system.
 * Its also provide constant related transaction object
 */
const debug = {
  dTimer: require('debug')('trxManager:dTimerHandler')
}
const models = require('../models')

const uid = require('./uid')

const dTimer = require('./dTimer')
const events = Object.create(require('events').prototype)

const fs = require('fs')
const path = require('path')

const appConfig = require('../configs/appConfig')
const types = require('../configs/trxManagerTypesConfig')

module.exports.transactionStatuses = types.transactionStatuses
module.exports.transactionSettlementStatuses = types.transactionSettlementStatuses
module.exports.transactionEvents = types.transactionEvents
module.exports.tokenTypes = types.tokenTypes
module.exports.userTokenTypes = types.userTokenTypes
module.exports.transactionFlags = types.transactionFlags
module.exports.transactionFlows = types.transactionFlows

module.exports.errorCodes = types.errorCodes

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
 * Get transaction data its payment provider data
 */
module.exports.getTransaction = async (transactionId) => {
  const transaction = await models.transaction.findOne({
    where: {
      id: transactionId
    },
    include: [
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
 * Get many payment provider(s)
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
    transaction: { ... } // complete transaction data (if any)
  }
 ```
 */
module.exports.emitTransactionEvent = (transactionEvent, transactionId, transaction) => {
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
    if (await exports.updateTransaction({ transactionStatus }, transactionId)) {
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
module.exports.createTransaction = async (transaction, options = {}) => {
  let ctx = Object.assign({
    flags: [],
    userToken: null,
    userTokenType: null,

    transaction,

    paymentProvider: null,
    agent: null,

    followUpType: null,

    redirectTo: null
  },
  options)

  if (!Array.isArray(ctx.flags)) ctx.flags = []

  ctx.paymentProvider = await exports.getPaymentProvidersByAgent(
    ctx.transaction.agentId,
    ctx.transaction.paymentProviderId
  )
  if (ctx.paymentProvider.length === 0) {
    return { error: exports.errorCodes.PAYMENT_PROVIDER_NOT_FOR_YOU }
  } else {
    ctx.paymentProvider = ctx.paymentProvider[0]
  }

  if (!ctx.flags.includes(exports.transactionFlags.NO_AMOUNT_CHECK)) {
    if (ctx.paymentProvider.minimumAmount) {
      if (ctx.amount < ctx.paymentProvider.minimumAmount) {
        return {
          error: exports.errorCodes.AMOUNT_TOO_LOW,
          errorMinimumAmount: ctx.paymentProvider.minimumAmount
        }
      }
    }

    if (ctx.paymentProvider.maximumAmount) {
      if (ctx.transaction.amount > ctx.paymentProvider.maximumAmount) {
        return {
          error: exports.errorCodes.AMOUNT_TOO_HIGH,
          errorMaximumAmount: ctx.paymentProvider.maximumAmount
        }
      }
    }
  }

  ctx.agent = await models.agent.findByPk(ctx.transaction.agentId, {
    include: [ models.merchant ]
  })

  let ppHandler = exports.findPpHandler(
    ctx.paymentProvider.paymentProviderConfig.handler
  )

  if (typeof ppHandler.checkHandler === 'function') {
    let returnValue = await ppHandler.checkHandler(ctx)
    if (returnValue) {
      if (returnValue.error) {
        return returnValue
      } else {
        return { error: exports.errorCode.JUST_ERROR }
      }
    }
  }

  if (ctx.checkResult) {
    return ctx.checkResult
  }

  let genId = uid.generateTransactionId(ctx.agent.merchant.shortName)
  ctx.transaction.id = genId.id
  ctx.transaction.idAlias = genId.idAlias
  ctx.transaction.transactionStatus = exports.transactionStatuses.CREATED

  ctx.transaction = models.transaction.build(ctx.transaction)

  if (typeof ppHandler.handler === 'function') {
    let returnValue = await ppHandler.handler(ctx)
    if (returnValue) {
      if (returnValue.error) {
        return returnValue
      } else {
        return { error: exports.errorCode.JUST_ERROR }
      }
    }
  }

  if (!await ctx.transaction.save()) return { error: exports.errorCode.JUST_ERROR }

  if (ctx.redirectTo && ctx.paymentProvider.gateway) {
    return {
      redirectTo: ctx.redirectTo
    }
  }

  let trxResult = {
    transactionId: ctx.transaction.id,
    transactionStatus: ctx.transaction.transactionStatus
  }

  if (ctx.transaction.token && ctx.transaction.tokenType) {
    trxResult.token = ctx.transaction.token
    trxResult.tokenType = ctx.transaction.tokenType
  }

  if (ctx.transaction.transactionStatus === exports.transactionStatuses.CREATED) {
    await dTimer.postEvent({
      event: exports.transactionEvents.GLOBAL_TIMEOUT,
      transactionId: ctx.transaction.id
    }, appConfig.transactionTimeoutSecond * 1000)
  }

  return trxResult
}

/**
 * Handle timeout event from redis timer
 */
dTimer.handleEvent(async (eventCtx) => {
  debug.dTimer('event', eventCtx)
  try {
    if (eventCtx.event === exports.transactionEvents.GLOBAL_TIMEOUT) {
      let ctx = {
        transaction: await exports.getTransaction(eventCtx.transactionId)
      }

      // transaction is already finished, do nothing
      if (
        [
          exports.transactionStatuses.SUCCESS,
          exports.transactionStatuses.FAILED
        ].includes(ctx.transaction.transactionStatus)
      ) {
        return
      }

      let ppHandler = exports.findPpHandler(
        ctx.transaction.paymentProvider.paymentProviderConfig.handler
      )

      // Handle transaction by each payment provider timeout handler
      if (typeof ppHandler.timeoutHandler === 'function') {
        await ppHandler.timeoutHandler(ctx)
      }

      ctx.updatedTransaction = Object.assign(
        {
          transactionStatus: exports.transactionStatuses.FAILED
        },
        ctx.updatedTransaction
      )

      await exports.updateTransaction(ctx.updatedTransaction, eventCtx.transactionId)

      if (ctx.updatedTransaction.transactionStatus === exports.transactionStatuses.FAILED) {
        exports.emitTransactionEvent(
          exports.transactionEvents.FAILED,
          eventCtx.transactionId
        )
      } else if (ctx.updatedTransaction.transactionStatus === exports.transactionStatuses.SUCCESS) {
        exports.emitTransactionEvent(
          exports.transactionEvents.SUCCESS,
          eventCtx.transactionId
        )
      }

      if (typeof ppHandler.timeoutPostHandler === 'function') {
        await ppHandler.timeoutPostHandler(ctx)
      }

      return true
    }
  } catch (err) {
    console.error(err)
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
 * Add all payment provider handlers
 */
const handlerDir = 'trxManagerHandlers'
fs
  .readdirSync(path.join(__dirname, handlerDir))
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    require(path.join(__dirname, handlerDir, file))(exports)
  })
