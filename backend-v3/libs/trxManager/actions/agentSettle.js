'use strict'

const { emitAgentSettleBatchEvent } = require('../event')
const ctxSettle = require('../ctxHelpers/ctxSettle')
const ctxCommon = require('../ctxHelpers/ctxCommon')
const {
  settleBatchStatuses
} = require('../constants')

module.exports.agentSettle = async ({
  agentId,
  settleBatchId,
  callback,
  ctxOptions = {}
}) => {
  const ctx = ctxSettle.init({
    buildOptions: {
      settleBatchId: settleBatchId,
      agentId: agentId
    },
    ...ctxOptions
  })
  await ctxCommon.doAgentLock(ctx, agentId)
  try {
    await ctxSettle.buildForSettle(ctx)
  } catch (err) {
    await ctx.lockDone()
    throw err
  }

  setImmediate(async () => {
    let error

    try {
      await ctxCommon.doHandlerCall(ctx, 'agentSettleHandler')
    } catch (err) {
      error = err
    }

    try {
      if (ctx.settleBatch.status === settleBatchStatuses.CLOSED) {
        ctx.acquirerConfigAgent.latestSettleBatchId = null
      } else {
        ctx.handlerFailed = true
        ctx.settleBatch.status = settleBatchStatuses.PROCESSING_ERROR
      }
      await ctx.settleBatch.save()
      await ctx.agent.save()
      await ctx.acquirerConfigAgent.save()
      await ctxSettle.removeTransactionEncryptedProperties(ctx)

      ctxCommon.doResult(ctx, {
        settleBatchId: ctx.settleBatch.id,
        settleBatchStatus: ctx.settleBatch.status,
        agentId: ctx.settleBatch.agentId
      })
    } catch (err) {
      error = err
    }
    await ctx.lockDone()
    await emitAgentSettleBatchEvent(ctx.settleBatch)

    await callback(error, ctx.result)
  })
}

module.exports.agentSettleAsync = ({
  agentId,
  settleBatchId,
  ctxOptions = {}
}) => {
  return new Promise((resolve, reject) => {
    exports.agentSettle({
      agentId,
      settleBatchId,
      callback: (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      },
      ctxOptions
    }).catch((err) => reject(err))
  })
}
