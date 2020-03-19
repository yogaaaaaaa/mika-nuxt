'use strict'

const models = require('models')
const ctxTrx = require('../ctxHelpers/ctxTrx')
const ctxCommon = require('../ctxHelpers/ctxCommon')

const event = require('../event')

/**
 * [DEV Only] Force update transaction, intended to use on development environment, it will invoke
 * acquirer forceUpdateHandler to check if acquirer host is able to update the transaction
 */
module.exports.forceStatusUpdate = async ({
  agentId,
  transactionId,
  newTransactionStatus,
  acquirerHostDoUpdate = false,
  syncWithAcquirerHost = false,
  ctxOptions = {}
}) => {
  const ctx = ctxTrx.init({
    newTransactionStatus,
    oldTransactionStatus: undefined,
    acquirerHostDoUpdate,
    syncWithAcquirerHost,
    buildOptions: {
      transactionId,
      agentId
    },
    ...ctxOptions
  })
  await ctxCommon.doAgentLock(ctx, agentId)

  try {
    await ctxTrx.buildForExistingTransaction(ctx)

    ctx.oldTransactionStatus = ctx.transaction.status

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
        await event.emitTransactionEvent(ctx.transaction, t)
      })
    }

    ctx.result = {
      ...ctx.result,

      transactionId: ctx.transaction.id,
      oldTransactionStatus: ctx.oldTransactionStatus,
      transactionStatus: ctx.newTransactionStatus,
      syncWithAcquirerHost: ctx.syncWithAcquirerHost,
      acquirerHostDoUpdate: ctx.acquirerHostDoUpdate,
      createdAt: ctx.transaction.createdAt,
      updatedAt: ctx.transaction.updatedAt
    }
  } catch (err) {
    await ctx.lockDone()
    throw err
  }
  await ctx.lockDone()
  return ctx.result
}
