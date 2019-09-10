'use strict'

/**
 * Provide all functionality to create transaction in mika system.
 * Its also provide constant related transaction object
 */

const fs = require('fs')
const path = require('path')

const EventEmitter2 = require('eventemitter2').EventEmitter2

const models = require('../models')
const Sequelize = models.Sequelize
const Op = Sequelize.Op
const uid = require('./uid')
const dTimer = require('./dTimer')
const events = new EventEmitter2()

const config = require('../configs/trxManagerConfig')
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

module.exports.config = config

/**
 * Generate transaction event id for dtimer
 */
const transactionEventId = (transactionId) => `trx-${transactionId}`

/**
 * Create trxManager style error
 */
module.exports.error = (name, message) => {
  let error = Error(message)
  error.name = name || exports.errorTypes.JUST_ERROR
  return error
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
 * Emit transaction status change (via EventEmitter2).
 */
module.exports.emitStatusChange = async (transaction, dbTransaction) => {
  try {
    await events.emitAsync(exports.eventTypes.TRANSACTION_STATUS_CHANGE, {
      transactionId: transaction.id,
      transactionStatus: transaction.status,
      transactionSettlementStatus: transaction.settlementStatus,
      agentId: transaction.agentId,
      acquirerId: transaction.acquirerId,
      t: dbTransaction
    })
  } catch (err) {
    console.log(err)
  }
}

/**
 * Listen to transaction status change (via EventEmitter2)
 */
module.exports.listenStatusChange = (handler) => {
  events.addListener(exports.eventTypes.TRANSACTION_STATUS_CHANGE, handler)
}

/**
 * Build transaction context
 * (include agent, merchant, acquirer, and its handler)
 */
module.exports.buildTransactionCtx = async (transaction, options = {}) => {
  let ctx = {
    transaction,
    transactionRefunds: [],
    acquirer: null,
    agent: null,
    acquirerHandler: null
  }

  options = Object.assign(
    {
      transactionId: null,
      agentId: null,
      transactionStatuses: null
    },
    options
  )

  if (options.transactionId) {
    let whereTransaction = {
      id: options.transactionId
    }
    if (Array.isArray(options.transactionStatuses)) {
      whereTransaction.status = {
        [Op.in]: options.transactionStatuses
      }
    }
    if (options.agentId) {
      whereTransaction.agentId = options.agentId
    }
    await models.sequelize.transaction(async t => {
      ctx.transaction = await models.transaction
        .scope('trxManager')
        .findOne({
          where: whereTransaction
        }, { transaction: t })

      if (!ctx.transaction) throw exports.error(exports.errorTypes.INVALID_TRANSACTION)
      if (!ctx.transaction.agentId || !ctx.transaction.acquirerId) throw exports.error(exports.errorTypes.INVALID_TRANSACTION)

      ctx.agent = await models.agent
        .scope({
          include: [
            {
              model: models.outlet,
              include: [
                models.merchant
              ]
            }
          ]
        })
        .findByPk(ctx.transaction.agentId, { transaction: t })

      ctx.acquirer = await models.acquirer
        .scope(
          'acquirerType',
          'acquirerConfig'
        )
        .findByPk(ctx.transaction.acquirerId, { transaction: t })

      ctx.transactionRefunds = await models.transactionRefund
        .findAll({ where: { transactionId: ctx.transaction.id }, transaction: t })
    })
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
  let ctx = Object.assign(
    await exports.buildTransactionCtx(transaction),
    {
      redirectTo: null,
      flags: []
    },
    options
  )

  let trxCreateResult = null

  if (ctx.acquirer.minimumAmount) {
    if (parseFloat(ctx.transaction.amount) < parseFloat(ctx.acquirer.minimumAmount)) {
      throw exports.error(exports.errorTypes.AMOUNT_TOO_LOW)
    }
  } else if (ctx.acquirerHandler.defaultMinimumAmount) {
    if (parseFloat(ctx.transaction.amount) < parseFloat(ctx.acquirerHandler.defaultMinimumAmount)) {
      throw exports.error(exports.errorTypes.AMOUNT_TOO_LOW)
    }
  }

  if (ctx.acquirer.maximumAmount) {
    if (parseFloat(ctx.transaction.amount) > parseFloat(ctx.acquirer.maximumAmount)) {
      throw exports.error(exports.errorTypes.AMOUNT_TOO_HIGH)
    }
  } else if (ctx.acquirerHandler.defaultMaximumAmount) {
    if (parseFloat(ctx.transaction.amount) > parseFloat(ctx.acquirerHandler.defaultMaximumAmount)) {
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
      throw exports.error(exports.errorTypes.INVALID_USER_TOKEN_TYPE)
    }
  }

  let genId = await uid.generateTransactionId()
  ctx.transaction.id = genId.id
  ctx.transaction.idAlias = genId.idAlias
  ctx.transaction.status = exports.transactionStatuses.CREATED
  ctx.transaction = models.transaction.build(ctx.transaction)

  if (typeof ctx.acquirerHandler.handler === 'function') {
    let handlerResult = await ctx.acquirerHandler.handler(ctx)
    if (handlerResult) trxCreateResult = handlerResult // override trxCreateResult, if any
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

  // Create expiry handler
  if (ctx.transaction.status === exports.transactionStatuses.CREATED) {
    await dTimer.postEvent({
      id: transactionEventId(ctx.transaction.id),
      event: exports.eventTypes.TRANSACTION_EXPIRY,
      transactionId: ctx.transaction.id
    }, exports.config.transactionExpirySecond * 1000)
  }

  if (!trxCreateResult) {
    trxCreateResult = {
      transactionId: ctx.transaction.id,
      agentId: ctx.transaction.agentId,
      acquirerId: ctx.transaction.acquirerId,
      amount: ctx.transaction.amount,
      transactionStatus: ctx.transaction.status,
      transactionSettlementStatus: ctx.transaction.settlementStatus,
      createdAt: ctx.transaction.createdAt
    }
    if (ctx.transaction.status === exports.transactionStatuses.CREATED) {
      trxCreateResult.expirySecond = exports.config.transactionExpirySecond || undefined
    }
    if (ctx.transaction.token && ctx.transaction.tokenType) {
      trxCreateResult.token = ctx.transaction.token
      trxCreateResult.tokenType = ctx.transaction.tokenType
    }
  }

  return trxCreateResult
}

/**
 * Cancel created transaction, it will invoke
 * acquirer cancelHandler if exist
 */
module.exports.cancel = async (transactionId) => {
  let ctx = await exports.buildTransactionCtx(null, {
    transactionId,
    transactionStatuses: [
      exports.transactionStatuses.CREATED
    ]
  })

  ctx.transaction.status = exports.transactionStatuses.CANCELED

  if (typeof ctx.acquirerHandler.cancelHandler === 'function') {
    await ctx.acquirerHandler.cancelHandler(ctx)
  }

  await ctx.transaction.save()

  let trxCancelResult = {
    transactionId: ctx.transaction.id,
    agentId: ctx.transaction.agentId,
    acquirerId: ctx.transaction.acquirerId,
    amount: ctx.transaction.amount,
    transactionStatus: ctx.transaction.status,
    createdAt: ctx.transaction.createdAt,
    updatedAt: ctx.transaction.updatedAt
  }

  return trxCancelResult
}

/**
 * Void successful transaction, it will invoke
 * acquirer voidHandler
 */
module.exports.void = async (transactionId) => {
  let ctx = await exports.buildTransactionCtx(null, {
    transactionId,
    transactionStatuses: [
      exports.transactionStatuses.SUCCESS
    ]
  })

  if (!ctx.acquirerHandler.properties.flows.includes(exports.transactionFlows.VOID)) {
    throw exports.error(exports.errorTypes.VOID_NOT_SUPPORTED)
  }

  ctx.transaction.status = exports.transactionStatuses.VOIDED

  await ctx.acquirerHandler.voidHandler(ctx)

  await ctx.transaction.save()

  let trxVoidResult = {
    transactionId: ctx.transaction.id,
    agentId: ctx.transaction.agentId,
    acquirerId: ctx.transaction.acquirerId,
    amount: ctx.transaction.amount,
    transactionStatus: ctx.transaction.status,
    voidReason: ctx.transaction.voidReason,
    createdAt: ctx.transaction.createdAt,
    updatedAt: ctx.transaction.updatedAt
  }

  return trxVoidResult
}

/**
 * Refund successful, or partially refunded transaction, it will invoke
 * acquirer refundHandler
 */
module.exports.refund = async (transactionRefund, options) => {
  let ctx = Object.assign(
    await exports.buildTransactionCtx(null, {
      transactionId: transactionRefund.transactionId,
      transactionStatuses: [
        exports.transactionStatuses.SUCCESS,
        exports.transactionStatuses.REFUNDED_PARTIAL
      ]
    }),
    {
      transactionRefund: transactionRefund
    },
    options
  )

  const amount = parseInt(ctx.transaction.amount)
  const totalRefundAmount = parseInt(ctx.transaction.get('totalRefundAmount') || 0)
  ctx.transactionRefund.amount = parseInt(ctx.transactionRefund.amount)

  if (!ctx.transactionRefund.amount) {
    ctx.transactionRefund.amount = amount - totalRefundAmount
  }

  const newTotalRefundAmount = totalRefundAmount + ctx.transactionRefund.amount

  if (newTotalRefundAmount < totalRefundAmount || newTotalRefundAmount > amount) {
    throw exports.error(exports.errorTypes.INVALID_REFUND_AMOUNT)
  }

  if (!ctx.acquirerHandler.properties.flows.includes(exports.transactionFlows.REFUND)) {
    throw exports.error(exports.errorTypes.REFUND_NOT_SUPPORTED)
  }

  if (
    !ctx.acquirerHandler.properties.flows.includes(exports.transactionFlows.PARTIAL_REFUND) &&
    amount !== ctx.transactionRefund.amount
  ) {
    throw exports.error(exports.errorTypes.PARTIAL_REFUND_NOT_SUPPORTED)
  }

  ctx.transactionRefund = models.transactionRefund.build(transactionRefund)
  ctx.transactionRefund.id = uid.generateUlid().base62mika

  if (newTotalRefundAmount === amount) {
    ctx.transaction.status = exports.transactionStatuses.REFUNDED
  } else {
    ctx.transaction.status = exports.transactionStatuses.REFUNDED_PARTIAL
  }

  await ctx.acquirerHandler.refundHandler(ctx)

  await models.sequelize.transaction(async t => {
    await ctx.transaction.changed('updatedAt', true)

    await ctx.transactionRefund.save({ transaction: t })
    await ctx.transaction.save({ transaction: t })

    await ctx.transaction.reload({ transaction: t })
    await ctx.transactionRefund.reload({ transaction: t })
  })

  let trxRefundResult = {
    transactionId: ctx.transaction.id,
    agentId: ctx.transaction.agentId,
    acquirerId: ctx.transaction.acquirerId,
    amount: ctx.transaction.amount,
    totalRefundAmount: ctx.transaction.get('totalRefundAmount'),
    refundAmount: ctx.transactionRefund.amount,
    transactionStatus: ctx.transaction.status,
    createdAt: ctx.transaction.createdAt,
    updatedAt: ctx.transaction.updatedAt
  }

  return trxRefundResult
}

module.exports.check = async (transaction, options = {}) => {
}

module.exports.followUp = async (transaction, options = {}) => {
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
      await models.sequelize.transaction(async t => {
        await transaction.save({ transaction: t })
        await exports.emitStatusChange(transaction, t)
      })
      return transaction
    }
  }
}

/**
 * Force update transaction, intended to use on development environment, it will invoke
 * acquirer forceUpdateHandler to check if acquirer host is able to update the transaction
 */
module.exports.forceStatusUpdate = async (transactionId, newTransactionStatus, options) => {
  let ctx = await exports.buildTransactionCtx(null, {
    transactionId: transactionId,
    agentId: options.agentId
  })
  Object.assign(
    ctx,
    {
      newTransactionStatus,
      oldTransactionStatus: ctx.transaction.status,
      acquirerHostDoUpdate: false,
      syncWithAcquirerHost: false
    },
    options
  )

  if (
    ctx.acquirer.acquirerConfig.sandbox &&
    ctx.syncWithAcquirerHost &&
    typeof ctx.acquirerHandler.forceStatusUpdateHandler === 'function'
  ) {
    await ctx.acquirerHandler.forceStatusUpdateHandler(ctx)
  }

  if (!ctx.acquirerHostDoUpdate) {
    await models.sequelize.transaction(async t => {
      ctx.transaction.status = ctx.newTransactionStatus
      await ctx.transaction.save({ transaction: t })
      await exports.emitStatusChange(ctx.transaction, t)
    })
  }

  let trxForceUpdateResult = {
    transactionId: ctx.transaction.id,
    oldTransactionStatus: ctx.oldTransactionStatus,
    transactionStatus: ctx.newTransactionStatus,
    syncWithAcquirerHost: ctx.syncWithAcquirerHost,
    acquirerHostDoUpdate: ctx.acquirerHostDoUpdate
  }

  return trxForceUpdateResult
}

/**
 * Handle event from dTimer
 */
dTimer.handleEvent(async (event) => {
  try {
    if (event.event === exports.eventTypes.TRANSACTION_EXPIRY) {
      let ctx = await exports.buildTransactionCtx(null, { transactionId: event.transactionId })

      if (ctx.transaction.status === exports.transactionStatuses.CREATED) {
        ctx.transaction.status = exports.transactionStatuses.EXPIRED

        if (typeof ctx.acquirerHandler.expiryHandler === 'function') {
          await ctx.acquirerHandler.expiryHandler(ctx)
        }

        await models.sequelize.transaction(async t => {
          await ctx.transaction.save({ transaction: t })
          await exports.emitStatusChange(ctx.transaction, t)
        })
      }

      return true
    }
  } catch (err) {
    console.error(err)
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
