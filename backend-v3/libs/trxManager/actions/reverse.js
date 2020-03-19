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
 * Reverse/Cancel state of transaction, it will invoke
 * cancelHandler, reverseHandler, or reverseVoidHandler respectively.
 *
 * Reverse is also used when de-sync occurs between client and server,
 * e.g client received state of transaction successfully,
 * but failed to display its status to customer.
 *
 */
module.exports.reverse = async ({
  agentId,
  transactionId = undefined,
  agentOrderReference = undefined,
  ctxOptions = {}
}) => {
  const ctx = ctxTrx.init({
    buildOptions: {
      transactionId: transactionId,
      agentOrderReference: agentOrderReference,
      agentId: agentId,

      ignoreUnfinishedTransaction: true,
      getLastTransaction: !(transactionId || agentOrderReference),

      transactionStatuses: [
        transactionStatuses.CREATED,
        transactionStatuses.PROCESSING,
        transactionStatuses.SUCCESS,
        transactionStatuses.VOIDING,
        transactionStatuses.VOIDED
      ]
    },
    ...ctxOptions
  })
  await ctxCommon.doAgentLock(ctx, agentId)

  try {
    await ctxTrx.buildForExistingTransaction(ctx)

    const lastTransactionStatus = ctx.transaction.status

    ctx.handlerTimeMs = new Date().getTime()
    try {
      const successStatuses = [
        transactionStatuses.PROCESSING,
        transactionStatuses.SUCCESS
      ]
      const voidStatuses = [
        transactionStatuses.VOIDING,
        transactionStatuses.VOIDED
      ]

      if (ctx.transaction.status === transactionStatuses.CREATED) {
        ctx.transaction.status = transactionStatuses.CANCELED
        if (typeof ctx.acquirerHandler.cancelHandler === 'function') {
          await ctx.acquirerHandler.cancelHandler(ctx)
        }
      } else if (
        ctx.acquirerHandler.properties.flows.includes(transactionFlows.REVERSE_SUCCESS) &&
          successStatuses.includes(ctx.transaction.status)
      ) {
        await ctx.acquirerHandler.reverseHandler(ctx)
      } else if (
        ctx.acquirerHandler.properties.flows.includes(transactionFlows.REVERSE_VOID) &&
          voidStatuses.includes(ctx.transaction.status)
      ) {
        await ctx.acquirerHandler.reverseVoidHandler(ctx)
      } else {
        throw createError({
          name: errorTypes.REVERSE_NOT_SUPPORTED
        })
      }
    } catch (err) {
      // decorate and return rethrow error
      err.data = {
        handler: ctx.acquirerHandler.name,
        handlerError: err.data || undefined
      }
      throw err
    }
    ctx.handlerTimeMs = (new Date().getTime()) - ctx.handlerTimeMs

    if (ctx.transaction.status === lastTransactionStatus) {
      ctx.handlerFailed = true
      ctx.transaction.status = lastTransactionStatus
    }

    await ctx.transaction.save()

    ctx.result = {
      ...ctx.result,
      handler: ctx.acquirerHandler.name,
      handlerResponse: ctx.handlerResponse,
      handlerTimeMs: ctx.handlerTimeMs,
      handlerFailed: ctx.handlerFailed,

      // transaction: ctx.transaction,

      /** Deprecated field */
      transactionId: ctx.transaction.id,
      agentId: ctx.transaction.agentId,
      acquirerId: ctx.transaction.acquirerId,
      amount: ctx.transaction.amount,
      transactionStatus: ctx.transaction.status,
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
