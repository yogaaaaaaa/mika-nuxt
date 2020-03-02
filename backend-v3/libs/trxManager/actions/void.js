'use strict'

const { createError } = require('libs/error')
const ctxTrx = require('../ctxHelpers/ctxTrx')
const ctxCommon = require('../ctxHelpers/ctxCommon')

const {
  errorTypes,
  transactionStatuses,
  transactionFlows
} = require('../constants')

/**
 * Void a success transaction, it will invoke
 * acquirer voidHandler
 */
module.exports.void = async ({
  agentId,
  transactionId,
  voidReason = null
}) => {
  const ctx = ctxTrx.init({
    reversed: false,
    buildOptions: {
      transactionId: transactionId,
      agentId: agentId,
      transactionStatuses: [
        transactionStatuses.SUCCESS
      ]
    }
  })
  await ctxCommon.doAgentLock(ctx, agentId)

  try {
    await ctxTrx.buildForExistingTransaction(ctx)

    if (!ctx.acquirerHandler.properties.flows.includes(transactionFlows.VOID)) {
      throw createError({
        name: errorTypes.VOID_NOT_SUPPORTED
      })
    }

    if (ctx.acquirerHandler.useTraceNumber) {
      ctx.transaction.voidTraceNumber = ctx.agent.traceNumberCounter
    }
    ctx.transaction.voidReason = voidReason

    ctx.handlerTimeMs = new Date().getTime()
    try {
      await ctx.acquirerHandler.voidHandler(ctx)
    } catch (err) {
      // decorate and return rethrow error
      err.data = {
        handler: ctx.acquirerHandler.name,
        handlerError: err.data || undefined
      }
      throw err
    }
    ctx.handlerTimeMs = (new Date().getTime()) - ctx.handlerTimeMs

    // Call void reverse handler with new context, if status is still voiding
    if (ctx.transaction.status === transactionStatuses.VOIDING) {
      ctx.handlerFailed = true
      if (typeof ctx.acquirerHandler.reverseVoidHandler === 'function') {
        try {
          await ctx.acquirerHandler.reverseVoidHandler(Object.assign({}, ctx))
          if (ctx.transaction.status === transactionStatuses.SUCCESS) {
            ctx.reversed = true
          }
        } catch (err) {}
      }
    }

    await ctx.transaction.save()

    ctx.result = {
      ...ctx.result,
      handler: ctx.acquirerHandler.name,
      handlerResponse: ctx.handlerResponse,
      handlerTimeMs: ctx.handlerTimeMs,
      handlerFailed: ctx.handlerFailed,

      reversed: ctx.reversed,

      // transaction: ctx.transaction,

      /** Deprecated field */
      transactionId: ctx.transaction.id,
      agentId: ctx.transaction.agentId,
      acquirerId: ctx.transaction.acquirerId,
      amount: ctx.transaction.amount,
      transactionStatus: ctx.transaction.status,
      voidReason: ctx.transaction.voidReason,
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
