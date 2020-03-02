'use strict'

const models = require('models')
const { sequelize } = models

const { createError } = require('libs/error')

const { errorTypes, settleBatchStatuses } = require('../constants')

const query = require('./query')
const ctxCommon = require('./ctxCommon')

async function doNewTransaction (ctx, t) {
  ctx.agent = await query.newTransaction.findAgentAndFriends(ctx, t)
  if (!ctx.agent) {
    throw createError({
      name: errorTypes.INVALID_AGENT
    })
  }
  if (!ctx.agent.outlet.merchant.acquirers.length) {
    throw createError({
      name: errorTypes.INVALID_ACQUIRER
    })
  }
  ctx.acquirer = ctx.agent.outlet.merchant.acquirers[0]
  ctx.acquirerConfig = ctx.acquirer.acquirerConfig
  ctx.acquirerConfigAgent = await query.newTransaction.findAcquirerConfigAgent(ctx, t)
  ctx.acquirerConfigOutlet = await query.newTransaction.findAcquirerConfigOutlet(ctx, t)
}

async function doExistingTransaction (ctx, t) {
  ctx.transaction = await query.existingTransaction.findTransactionAndFriends(ctx, t)

  if (!ctx.transaction) {
    throw createError({
      name: errorTypes.INVALID_TRANSACTION
    })
  }
  if (ctx.buildOptions.getLastTransaction) {
    if (
      Array.isArray(ctx.buildOptions.transactionStatuses) &&
      !ctx.buildOptions.transactionStatuses.includes(ctx.transaction.status)
    ) {
      throw createError({
        name: errorTypes.INVALID_TRANSACTION
      })
    }
  }

  if (
    ctx.transaction.settleBatch &&
    ctx.transaction.settleBatch.status !== settleBatchStatuses.OPEN
  ) {
    throw createError({
      name: errorTypes.INVALID_TRANSACTION
    })
  }

  ctx.agent = ctx.transaction.agent
  ctx.acquirer = ctx.transaction.acquirer
  ctx.acquirerConfig = ctx.acquirer.acquirerConfig
  ctx.acquirerConfigAgent = ctx.transaction.acquirerConfigAgent
  ctx.acquirerConfigOutlet = ctx.transaction.acquirerConfigOutlet
  ctx.settleBatch = ctx.transaction.settleBatch
  ctx.settleBatchIn = ctx.transaction.settleBatchIn

  // ctx.transactionRefunds = await query.existingTransaction.findTransactionRefunds(ctx, t)
}

async function doCommon (ctx, t) {
  ctxCommon.doAcquirerConfig(ctx)

  // Check if classes is correct
  if (!ctx.acquirerHandler.classes.includes(ctx.acquirer.acquirerType.class)) {
    throw createError({
      name: errorTypes.INVALID_ACQUIRER_HANDLER
    })
  }

  // Check whether this handler is strictly single transaction
  if (ctx.acquirerHandler.singleTransactionOnly && !ctx.buildOptions.ignoreUnfinishedTransaction) {
    const unfinishedTransaction = await query.findUnfinishedTransaction(ctx, t)
    if (unfinishedTransaction) {
      throw createError({
        name: errorTypes.UNFINISHED_TRANSACTION_EXIST,
        data: {
          transactionId: unfinishedTransaction.id
        }
      })
    }
  }

  await ctxCommon.doAgentTraceNumber(ctx, t)
  await ctxCommon.doEncryptionKey(ctx)

  // Prepare the DEK and decrypt the SECRET
  if (typeof ctx.transaction.setupEncryptedProperties === 'function') {
    ctx.transaction.setupEncryptedProperties(ctx.dekBuffer)
  }
}

async function doSettleBatch (ctx, t) {
  if (ctx.acquirerHandler.settleByAcquirerConfigAgent) {
    if (!ctx.acquirerConfigAgent.acquirerTerminalId) {
      throw createError({
        name: errorTypes.INVALID_ACQUIRER_CONFIG
      })
    }

    if (!ctx.acquirerConfigAgent.latestSettleBatchId) {
      ctx.acquirerConfigAgent.incrementBatchCounter()

      ctx.settleBatch = await models.settleBatch.create({
        acquirerConfigId: ctx.acquirer.acquirerConfig.id,
        agentId: ctx.agent.id,
        batchNumber: ctx.acquirerConfigAgent.batchNumberCounter,
        status: settleBatchStatuses.OPEN
      }, { transaction: t })

      ctx.acquirerConfigAgent.latestSettleBatchId = ctx.settleBatch.id
      await ctx.acquirerConfigAgent.save({ transaction: t })
    } else {
      ctx.settleBatch = await models.settleBatch.findOne({
        where: {
          id: ctx.acquirerConfigAgent.latestSettleBatchId,
          status: settleBatchStatuses.OPEN
        }
      })
      if (!ctx.settleBatch) {
        throw createError({
          name: errorTypes.UNFINISHED_SETTLE_BATCH
        })
      }
    }
  }
}

/**
 * Initialize context with common variable
 */
module.exports.init = (ctx) => {
  return {
    transaction: undefined,
    transactionRefund: undefined,
    // transactionRefunds: undefined,
    acquirer: undefined,
    agent: undefined,
    acquirerHandler: undefined,
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

/**
 * Start building common context for processing
 * new transaction
 */
module.exports.buildForNewTransaction = async (ctx) => {
  await sequelize.transaction(async (t) => {
    await doNewTransaction(ctx, t)
    await doCommon(ctx, t)
    await doSettleBatch(ctx, t)
  })
}

/**
 * Build common context for
 * processing existing transaction
 */
module.exports.buildForExistingTransaction = async (ctx) => {
  await sequelize.transaction(async (t) => {
    await doExistingTransaction(ctx, t)
    await doCommon(ctx, t)
  })
}
