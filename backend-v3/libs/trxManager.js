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

const commonConfig = require('../configs/commonConfig')
const { msgTypes } = require('./types/msgTypes')
const types = require('./types/trxManagerTypes')

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
 * Map trxManager errorTypes to msg msgTypes
 */
module.exports.errorToMsgTypes = (err) => {
  if (err.name === exports.errorTypes.AMOUNT_TOO_LOW) {
    return msgTypes.MSG_ERROR_TRANSACTION_AMOUNT_TOO_LOW
  } else if (err.name === exports.errorTypes.AMOUNT_TOO_HIGH) {
    return msgTypes.MSG_ERROR_TRANSACTION_AMOUNT_TOO_HIGH
  } else if (err.name === exports.errorTypes.NEED_USER_TOKEN) {
    return msgTypes.MSG_ERROR_TRANSACTION_NEED_USER_TOKEN
  } else if (err.name === exports.errorTypes.INVALID_ACQUIRER) {
    return msgTypes.MSG_ERROR_TRANSACTION_INVALID_ACQUIRER
  } else if (err.name === exports.errorTypes.ACQUIRER_NOT_RESPONDING) {
    return msgTypes.MSG_ERROR_TRANSACTION_ACQUIRER_NOT_RESPONDING
  } else if (err.name === exports.errorTypes.INVALID_TRANSACTION) {
    return msgTypes.MSG_ERROR_TRANSACTION_INVALID
  } else if (err.name === exports.errorTypes.INVALID_AGENT) {
    return msgTypes.MSG_ERROR_TRANSACTION_INVALID_AGENT
  } else if (err.name === exports.errorTypes.INVALID_USER_TOKEN) {
    return msgTypes.MSG_ERROR_TRANSACTION_INVALID_USER_TOKEN
  } else if (err.name === exports.errorTypes.NEED_USER_TOKEN_TYPE) {
    return msgTypes.MSG_ERROR_TRANSACTION_NEED_USER_TOKEN_TYPE
  } else if (err.name === exports.errorTypes.USER_TOKEN_TYPE_NOT_SUPPORTED) {
    return msgTypes.MSG_ERROR_TRANSACTION_USER_TOKEN_NOT_SUPPORTED
  } else if (err.name === exports.errorTypes.INVALID_ACQUIRER_HANDLER) {
    return msgTypes.MSG_ERROR_TRANSACTION_INVALID_ACQUIRER_CONFIG
  } else if (err.name === exports.errorTypes.INVALID_ACQUIRER_CONFIG) {
    return msgTypes.MSG_ERROR_TRANSACTION_INVALID_ACQUIRER_CONFIG
  }
}

/**
 * Array containing acquirer handler
 */
module.exports.acquirerHandlers = []

/**
 * Find acquirer handler object
 * based its handler name
 */
module.exports.findAcquirerHandler = (name) => {
  name = name.toLowerCase()
  name = name.replace(' ', '_')
  for (let pp of exports.acquirerHandlers) {
    if (pp.name === name) {
      return pp
    }
  }
}

/**
 * Construct a displayable handler information from acquirer handler object
 */
module.exports.formatAcquirerInfo = (acquirerHandler) => {
  return {
    name: acquirerHandler.name,
    classes: acquirerHandler.classes,
    defaultMaximumAmount: acquirerHandler.defaultMaximumAmount ? acquirerHandler.defaultMaximumAmount : null,
    defaultMinimumAmount: acquirerHandler.defaultMinimumAmount ? acquirerHandler.defaultMinimumAmount : null,
    properties: acquirerHandler.properties
  }
}

/**
 * Return an displayable acquirer handler information
 * by its handler name
 */
module.exports.getAcquirerInfo = (handlerName) => {
  let acquirerHandler = exports.findAcquirerHandler(handlerName)
  if (acquirerHandler) return exports.formatAcquirerInfo(acquirerHandler)
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
    acquirerId: transaction.acquirerId
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
module.exports.forceStatus = async (transactionId, transactionStatus, agentId) => {
  if (transactionStatus) {
    let whereTransaction = {
      id: transactionId
    }
    if (agentId) {
      whereTransaction.agentId = agentId
    }

    const transaction = await models.transaction.findOne({
      where: whereTransaction
    })
    if (transaction) {
      transaction.status = transactionStatus
      await transaction.save()
      exports.emitStatusChange(transaction)
      return transaction
    }
  }
}

/**
 * Build transaction context
 * (include agent, merchant, acquirer, and its handler)
 */
module.exports.buildTransactionCtx = async (transaction, extraCtx) => {
  let ctx = Object.assign({
    transactionId: null,
    transaction,
    acquirer: null,
    agent: null,
    acquirerHandler: null
  }, extraCtx)

  if (ctx.transactionId) {
    ctx.transaction = await models.transaction.scope('trxManager').findByPk(ctx.transactionId)
    if (!ctx.transaction) throw exports.error(exports.errorTypes.INVALID_TRANSACTION)
    ctx.agent = ctx.transaction.agent
    ctx.acquirer = ctx.transaction.acquirer
  } else {
    ctx.agent = await models.agent.scope(
      { method: ['trxManager', ctx.transaction.acquirerId] }
    ).findByPk(ctx.transaction.agentId)

    if (!ctx.agent) throw exports.error(exports.errorTypes.INVALID_AGENT)

    if (!ctx.agent.outlet.merchant.acquirers.length) throw exports.error(exports.errorTypes.INVALID_ACQUIRER)
    ctx.acquirer = ctx.agent.outlet.merchant.acquirers[0]
  }

  if (!ctx.acquirer.acquirerConfig) throw exports.error(exports.errorTypes.INVALID_ACQUIRER_CONFIG)

  ctx.acquirerHandler = exports.findAcquirerHandler(ctx.acquirer.acquirerConfig.handler)
  if (!ctx.acquirerHandler) throw exports.error(exports.errorTypes.INVALID_ACQUIRER_HANDLER)

  return ctx
}

/**
 * Create new transaction, it will invoke
 * acquirer handler according to acquirerConfig.
 */
module.exports.create = async (transaction, options) => {
  let ctx = await exports.buildTransactionCtx(transaction, Object.assign({}, options, {
    redirectTo: null,
    flags: []
  }))

  let trxCreateResult = null

  if (ctx.acquirer.minimumAmount) {
    if (ctx.transaction.amount < ctx.acquirer.minimumAmount) {
      throw exports.error(exports.errorTypes.AMOUNT_TOO_LOW)
    }
  } else if (ctx.acquirerHandler.defaultMinimumAmount) {
    if (ctx.transaction.amount < ctx.acquirerHandler.defaultMinimumAmount) {
      throw exports.error(exports.errorTypes.AMOUNT_TOO_LOW)
    }
  }

  if (ctx.acquirer.maximumAmount) {
    if (ctx.transaction.amount > ctx.acquirer.maximumAmount) {
      throw exports.error(exports.errorTypes.AMOUNT_TOO_HIGH)
    }
  } else if (ctx.acquirerHandler.defaultMaximumAmount) {
    if (ctx.transaction.amount > ctx.acquirerHandler.defaultMaximumAmount) {
      throw exports.error(exports.errorTypes.AMOUNT_TOO_HIGH)
    }
  }

  if (
    ctx.acquirerHandler.properties.flows.includes(exports.transactionFlows.GET_TOKEN) &&
    !ctx.acquirerHandler.properties.flows.includes(exports.transactionFlows.PROVIDE_TOKEN) &&
    !ctx.transaction.userToken
  ) {
    throw exports.error(exports.errorTypes.NEED_USER_TOKEN)
  }

  if (
    ctx.acquirerHandler.properties.userTokenTypes.length > 1 &&
    !ctx.transaction.userTokenType &&
    ctx.transaction.userToken
  ) {
    throw exports.error(exports.errorTypes.NEED_USER_TOKEN_TYPE)
  }

  if (ctx.transaction.userTokenType) {
    if (!ctx.acquirerHandler.properties.userTokenTypes.includes(ctx.acquirerHandler.properties.userTokenTypes)) {
      throw exports.error(exports.errorTypes.USER_TOKEN_TYPE_NOT_SUPPORTED)
    }
  }

  let genId = await uid.generateTransactionId()
  ctx.transaction.id = genId.id
  ctx.transaction.idAlias = genId.idAlias
  ctx.transaction.status = exports.transactionStatuses.CREATED
  ctx.transaction = models.transaction.build(ctx.transaction)

  if (typeof ctx.acquirerHandler.handler === 'function') {
    let handlerResult = await ctx.acquirerHandler.handler(ctx)
    if (handlerResult) trxCreateResult = handlerResult
  }

  if (ctx.redirectTo && ctx.acquirer.gateway) {
    return {
      redirectTo: ctx.redirectTo
    }
  }

  if (typeof ctx.transaction.userToken !== 'string') {
    ctx.transaction.userToken = undefined
  }

  await models.sequelize.transaction(async t => {
    await ctx.transaction.save({ transaction: t })
    await ctx.transaction.reload({ transaction: t })
  })

  // create expiry handler
  if (ctx.transaction.status === exports.transactionStatuses.CREATED) {
    await dTimer.postEvent({
      event: exports.eventTypes.TRANSACTION_EXPIRY,
      transactionId: ctx.transaction.id
    }, commonConfig.transactionExpirySecond * 1000)
  }

  if (!trxCreateResult) {
    trxCreateResult = {
      transactionId: ctx.transaction.id,
      agentId: ctx.transaction.agentId,
      acquirerId: ctx.transaction.acquirerId,
      amount: ctx.transaction.amount,
      transactionStatus: ctx.transaction.status,
      transactionSettlementStatus: ctx.transaction.settlementStatus,
      createdAt: ctx.transaction.createdAt,
      expirySecond: ctx.transaction.status === exports.transactionStatuses.CREATED ? commonConfig.transactionExpirySecond : undefined
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
 * Handle expiry event from redis timer
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

      if (typeof ctx.acquirerHandler.expiryHandler === 'function') {
        await ctx.acquirerHandler.expiryHandler(ctx)
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
 * Add all acquirer handlers
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
