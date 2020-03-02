'use strict'

const models = require('models')
const { sequelize } = models
const { Op } = models.Sequelize

const { createError } = require('libs/error')
const { errorTypes, settleBatchStatuses, transactionStatuses } = require('../constants')
const query = require('./query')
const ctxCommon = require('./ctxCommon')

module.exports.init = (ctx) => {
  return {
    transactions: undefined,
    settleBatch: undefined,
    agent: undefined,
    acquirerHandler: undefined,
    acquirerConfig: undefined,
    acquirerConfigMerged: undefined,
    acquirerConfigOutlet: undefined,
    acquirerConfigAgent: undefined,

    handler: undefined,
    handlerResponse: undefined,
    handlerTimeMs: undefined,
    handlerFailed: false,

    buildOptions: {},
    local: {},
    result: {},

    lockDone: undefined,
    ...ctx
  }
}

module.exports.buildForSettle = async (ctx) => {
  await sequelize.transaction(async (t) => {
    ctx.settleBatch = await query.settle.findSettleBatch(ctx, t)
    if (!ctx.settleBatch) {
      throw createError({
        name: errorTypes.INVALID_SETTLE_BATCH
      })
    }

    ctx.agent = ctx.settleBatch.agent
    ctx.acquirerConfig = ctx.settleBatch.acquirerConfig
    ctx.acquirerConfigAgent = ctx.settleBatch.acquirerConfigAgent
    ctx.acquirerConfigOutlet = ctx.settleBatch.acquirerConfigOutlet

    ctxCommon.doAcquirerConfig(ctx)

    await ctxCommon.doAgentTraceNumber(ctx, t)
    ctx.settleBatch.traceNumber = ctx.agent.traceNumberCounter

    // Get transaction total
    const transactionTotal = await query.settle.findTotalTransactionAmount(ctx, t)
    ctx.settleBatch.status = settleBatchStatuses.PROCESSING
    ctx.settleBatch.amountSettle = transactionTotal.totalAmount || 0
    ctx.settleBatch.transactionSettleCount = transactionTotal.transactionCount || 0

    // Get transaction total by acquirer
    ctx.settleBatch.properties.totalByAcquirer =
      await query.settle.findTotalTransactionAmountByAcquirer(ctx, t)
    ctx.settleBatch.changed('properties', true)

    await ctx.settleBatch.save({ transaction: t })

    await ctxCommon.doEncryptionKey(ctx)
  })
}

module.exports.removeTransactionEncryptedProperties = async (ctx) => {
  if (ctx.settleBatch.status === settleBatchStatuses.CLOSED) {
    return models.transaction.update(
      {
        encryptedProperties: {}
      },
      {
        where: { settleBatchId: ctx.settleBatch.id }
      }
    )
  }
}

module.exports.doGetNextTransactions = async (ctx) => {
  if (!ctx.transactionsPage) {
    ctx.transactionsPage = {
      page: 1,
      perPage: 100
    }
  }
  ctx.transactions = await models.transaction.findAll({
    where: {
      settleBatchId: ctx.settleBatch.id,
      status: {
        [Op.in]: [
          transactionStatuses.SUCCESS,
          transactionStatuses.REFUNDED_PARTIAL
        ]
      }
    },
    offset: (ctx.transactionsPage.page - 1) * ctx.transactionsPage.perPage,
    limit: ctx.transactionsPage.perPage
  })
  ctx.transactionsPage.page++
  for (const transaction of ctx.transactions) {
    if (typeof transaction.setupEncryptedProperties === 'function') {
      transaction.setupEncryptedProperties(ctx.dekBuffer)
    }
  }

  return !!ctx.transactions.length
}
