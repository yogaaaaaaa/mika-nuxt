'use strict'

/**
 * Provide all functionality to create transaction in mika system.
 * Its also provide constant related transaction object
 */

const fs = require('fs')
const path = require('path')

const debug = {
  dTimer: require('debug')('trxManager:dTimerHandler')
}
const models = require('../models')
const uid = require('./uid')
const dTimer = require('./dTimer')
const events = Object.create(require('events').prototype)

const appConfig = require('../configs/appConfig')
const { msgTypes } = require('../configs/msgFactoryTypesConfig')
const types = require('../configs/trxManagerTypesConfig')

module.exports.types = types
module.exports.transactionStatuses = types.transactionStatuses
module.exports.transactionSettlementStatuses = types.transactionSettlementStatuses
module.exports.tokenTypes = types.tokenTypes
module.exports.userTokenTypes = types.userTokenTypes
module.exports.transactionFlags = types.transactionFlags
module.exports.transactionFlows = types.transactionFlows
module.exports.eventTypes = types.eventTypes

module.exports.errorTypes = types.errorTypes

/**
 * Create trxManager style error
 */
module.exports.error = (name, message) => {
  let error = Error(message)
  error.name = name
  return error
}

/**
 * Map trxManager errorTypes to msgFactory msgTypes
 */
module.exports.errorToMsgTypes = (err) => {
  if (err.name === exports.errorTypes.AMOUNT_TOO_LOW) {
    return msgTypes.MSG_ERROR_TRANSACTION_AMOUNT_TOO_LOW
  } else if (err.name === exports.errorTypes.AMOUNT_TOO_HIGH) {
    return msgTypes.MSG_ERROR_TRANSACTION_AMOUNT_TOO_HIGH
  } else if (err.name === exports.errorTypes.NEED_USER_TOKEN) {
    return msgTypes.MSG_ERROR_TRANSACTION_NEED_USER_TOKEN
  } else if (err.name === exports.errorTypes.INVALID_PAYMENT_PROVIDER) {
    return msgTypes.MSG_ERROR_TRANSACTION_INVALID_PAYMENT_PROVIDER
  } else if (err.name === exports.errorTypes.PAYMENT_PROVIDER_NOT_RESPONDING) {
    return msgTypes.MSG_ERROR_TRANSACTION_PAYMENT_PROVIDER_NOT_RESPONDING
  } else if (err.name === exports.errorTypes.INVALID_TRANSACTION) {
  } else if (err.name === exports.errorTypes.INVALID_AGENT) {
  }
}

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
}

/**
 * Emit transaction status change (via nodejs event emitter).
 */
module.exports.emitStatusChange = (transaction) => {
  events.emit(exports.eventTypes.TRANSACTION_STATUS_CHANGE, {
    transactionId: transaction.id,
    transactionStatus: transaction.status,
    transactionSettlementStatus: transaction.settlementStatus,
    agentId: transaction.agentId,
    paymentProviderId: transaction.paymentProviderId
  })
}

/**
 * Listen to transaction status change (via nodejs event emitter)
 */
module.exports.listenStatusChange = (handler) => {
  events.addListener(exports.eventTypes.TRANSACTION_STATUS_CHANGE, handler)
}

/**
 * Forcefully change transaction status, includes event emitter
 */
module.exports.forceStatus = async (transactionId, transactionStatus) => {
  if (transactionStatus) {
    let transaction = await models.transaction.findByPk(transactionId)

    if (transaction) {
      transaction.status = transactionStatus
      await transaction.save()
      exports.emitStatusChange(transaction)
      return transaction
    }
  }
}

/**
 * Build transaction context data (include agent, merchant, paymentProvider, and its handler)
 */
module.exports.buildTransactionCtx = async (transaction, extraCtx) => {
  let ctx = Object.assign({
    transactionId: null,
    transaction,
    paymentProvider: null,
    agent: null,
    ppHandler: null
  }, extraCtx)

  if (ctx.transactionId) {
    ctx.transaction = await models.transaction.scope('trxManager').findByPk(ctx.transactionId)
    if (!ctx.transaction) throw exports.error(exports.errorTypes.INVALID_TRANSACTION)
    ctx.agent = ctx.transaction.agent
    ctx.paymentProvider = ctx.transaction.paymentProvider
  } else {
    ctx.agent = await models.agent.scope(
      { method: ['trxManager', ctx.transaction.paymentProviderId] }
    ).findByPk(ctx.transaction.agentId)

    if (!ctx.agent) throw exports.error(exports.errorTypes.INVALID_AGENT)

    if (!ctx.agent.paymentProviders.length) throw exports.error(exports.errorTypes.INVALID_PAYMENT_PROVIDER)
    ctx.paymentProvider = ctx.agent.paymentProviders[0]
  }

  ctx.ppHandler = exports.findPpHandler(ctx.paymentProvider.paymentProviderConfig.handler)
  if (!ctx.ppHandler) throw exports.error(exports.errorTypes.INVALID_PAYMENT_PROVIDER_HANDLER)

  return ctx
}

module.exports.create = async (transaction, options) => {
  let ctx = await exports.buildTransactionCtx(transaction, Object.assign({}, options, {
    redirectTo: null,
    flags: []
  }))

  let trxCreateResult = null

  if (ctx.paymentProvider.minimumAmount) {
    if (ctx.transaction.amount < ctx.paymentProvider.minimumAmount) {
      throw exports.error(exports.errorTypes.AMOUNT_TOO_LOW)
    }
  }
  if (ctx.paymentProvider.maximumAmount) {
    if (ctx.transaction.amount > ctx.paymentProvider.maximumAmount) {
      throw exports.error(exports.errorTypes.AMOUNT_TOO_HIGH)
    }
  }

  let genId = uid.generateTransactionId(ctx.agent.merchant.shortName)
  ctx.transaction.id = genId.id
  ctx.transaction.idAlias = genId.idAlias
  ctx.transaction.status = exports.transactionStatuses.CREATED

  ctx.transaction = models.transaction.build(ctx.transaction)

  if (typeof ctx.ppHandler.handler === 'function') {
    let handlerResult = await ctx.ppHandler.handler(ctx)
    if (handlerResult) trxCreateResult = handlerResult
  }

  if (ctx.redirectTo && ctx.paymentProvider.gateway) {
    return {
      redirectTo: ctx.redirectTo
    }
  }

  if (typeof ctx.transaction.userToken === 'object') {
    ctx.transaction.userToken = undefined
  }
  await ctx.transaction.save()

  if (ctx.transaction.status === exports.transactionStatuses.CREATED) {
    await dTimer.postEvent({
      event: exports.eventTypes.TRANSACTION_EXPIRY,
      transactionId: ctx.transaction.id
    }, appConfig.transactionTimeoutSecond * 1000)
  }

  if (!trxCreateResult) {
    trxCreateResult = {
      transactionId: ctx.transaction.id,
      agentId: ctx.transaction.agentId,
      paymentProviderId: ctx.transaction.paymentProviderId,
      amount: ctx.transaction.amount,
      transactionStatus: ctx.transaction.status,
      transactionSettlementStatus: ctx.transaction.settlementStatus,
      createdAt: ctx.transaction.createdAt
    }
    if (ctx.transaction.token && ctx.transaction.tokenType) {
      trxCreateResult.token = ctx.transaction.token
      trxCreateResult.tokenType = ctx.transaction.tokenType
    }
  }

  return trxCreateResult
}

module.exports.check = async (transaction, options = {}) => {
}

module.exports.followUp = async (transaction, options = {}) => {
}

/**
 * Handle timeout event from redis timer
 */
dTimer.handleEvent(async (event) => {
  debug.dTimer('event', event)
  try {
    if (event.event === exports.eventTypes.TRANSACTION_EXPIRY) {
      let ctx = await exports.buildTransactionCtx(null, { transactionId: event.transactionId })

      if ([
        exports.transactionStatuses.SUCCESS,
        exports.transactionStatuses.FAILED
      ].includes(ctx.transaction.status)) return

      ctx.transaction.status = exports.transactionStatuses.FAILED

      if (typeof ctx.ppHandler.timeoutHandler === 'function') {
        await ctx.ppHandler.timeoutHandler(ctx)
      }

      await ctx.transaction.save()

      exports.emitStatusChange(ctx.transaction)

      return true
    }
  } catch (err) {
    console.error(err)
    return false
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
