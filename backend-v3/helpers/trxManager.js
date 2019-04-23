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
const types = require('../configs/trxManagerTypesConfig')

module.exports.types = types
module.exports.transactionStatuses = types.transactionStatuses
module.exports.transactionSettlementStatuses = types.transactionSettlementStatuses
module.exports.tokenTypes = types.tokenTypes
module.exports.userTokenTypes = types.userTokenTypes
module.exports.transactionFlags = types.transactionFlags
module.exports.transactionFlows = types.transactionFlows
module.exports.eventTypes = types.eventTypes

module.exports.errorCodes = types.errorCodes

/**
 * Create trxManager style error
 */
module.exports.error = (errorCode, message) => {
  let error = Error(message || errorCode)
  error.errorCode = errorCode
  return error
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
    ctx.transaction = await models.transaction.findOne({
      where: {
        id: ctx.transactionId
      },
      include: [
        {
          model: models.agent,
          include: [ models.merchant ]
        },
        {
          model: models.paymentProvider,
          include: [
            models.paymentProviderType,
            models.paymentProviderConfig
          ]
        }
      ]
    })
    if (!ctx.transaction) throw exports.error(exports.errorCodes.TRANSACTION_NOT_FOUND)
    ctx.agent = ctx.transaction.agent
    ctx.paymentProvider = ctx.transaction.paymentProvider
  } else {
    ctx.paymentProvider = await models.agentPaymentProvider.findOne({
      where: {
        agentId: ctx.transaction.agentId,
        paymentProviderId: ctx.transaction.paymentProviderId
      },
      include: [ {
        model: models.paymentProvider,
        include: [ models.paymentProviderType, models.paymentProviderConfig ]
      }]
    })

    if (!ctx.paymentProvider) throw exports.error(exports.errorCodes.PAYMENT_PROVIDER_NOT_FOR_YOU)
    ctx.paymentProvider = ctx.paymentProvider.paymentProvider

    ctx.agent = await models.agent.findByPk(ctx.transaction.agentId, {
      include: [ models.merchant ]
    })

    if (!ctx.agent) throw exports.error(exports.errorCodes.AGENT_NOT_FOUND)
  }

  ctx.ppHandler = exports.findPpHandler(
    ctx.paymentProvider.paymentProviderConfig.handler
  )
  if (!ctx.ppHandler) throw exports.error(exports.errorCodes.PAYMENT_PROVIDER_HANDLER_NOT_FOUND)

  return ctx
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

module.exports.create = async (transaction, options) => {
  let ctx = await exports.buildTransactionCtx(transaction, Object.assign(options, {
    redirectTo: null,
    flags: []
  }))
  let trxCreateResult = null

  if (!ctx.flags.includes(exports.transactionFlags.NO_AMOUNT_CHECK)) {
    if (ctx.paymentProvider.minimumAmount) {
      if (ctx.transaction.amount < ctx.paymentProvider.minimumAmount) {
        throw exports.error(exports.errorCodes.AMOUNT_TOO_LOW)
      }
    }
    if (ctx.paymentProvider.maximumAmount) {
      if (ctx.transaction.amount > ctx.paymentProvider.maximumAmount) {
        throw exports.error(exports.errorCodes.AMOUNT_TOO_HIGH)
      }
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
      transactionStatus: ctx.transaction.status
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
