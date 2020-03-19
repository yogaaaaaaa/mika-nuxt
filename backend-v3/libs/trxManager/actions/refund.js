'use strict'

const uid = require('libs/uid')
const models = require('models')

const { createError } = require('libs/error')
const ctxTrx = require('../ctxHelpers/ctxTrx')
const ctxCommon = require('../ctxHelpers/ctxCommon')

const {
  errorTypes,
  transactionStatuses,
  transactionFlows
} = require('../constants')

/**
 * Refund a success, or partially refunded transaction, it will invoke
 * acquirer refundHandler
 */
module.exports.refund = async ({
  agentId,
  transactionRefund,
  ctxOptions = {}
}) => {
  const ctx = ctxTrx.init({
    transactionRefund,
    buildOptions: {
      transactionId: transactionRefund.transactionId,
      agentId,
      transactionStatuses: [
        transactionStatuses.SUCCESS,
        transactionStatuses.REFUNDED_PARTIAL
      ]
    },
    ...ctxOptions
  })
  await ctxCommon.doAgentLock(ctx, agentId)

  try {
    await ctxTrx.buildForExistingTransaction(ctx)

    const amount = parseInt(ctx.transaction.amount)
    const totalRefundAmount = parseInt(ctx.transaction.get('totalRefundAmount') || 0)
    ctx.transactionRefund.amount = parseInt(ctx.transactionRefund.amount)

    if (!ctx.transactionRefund.amount) {
      ctx.transactionRefund.amount = amount - totalRefundAmount
    }

    const newTotalRefundAmount = totalRefundAmount + ctx.transactionRefund.amount

    if (newTotalRefundAmount < totalRefundAmount || newTotalRefundAmount > amount) {
      throw createError({
        name: errorTypes.INVALID_REFUND_AMOUNT
      })
    }

    if (!ctx.acquirerHandler.properties.flows.includes(transactionFlows.REFUND)) {
      throw createError({
        name: errorTypes.REFUND_NOT_SUPPORTED
      })
    }

    if (
      !ctx.acquirerHandler.properties.flows.includes(transactionFlows.PARTIAL_REFUND) &&
        amount !== ctx.transactionRefund.amount
    ) {
      throw createError({
        name: errorTypes.PARTIAL_REFUND_NOT_SUPPORTED
      })
    }

    ctx.transactionRefund = models.transactionRefund.build(transactionRefund)
    ctx.transactionRefund.id = uid.generateUlid().base62mika

    if (newTotalRefundAmount === amount) {
      ctx.transaction.status = transactionStatuses.REFUNDED
    } else {
      ctx.transaction.status = transactionStatuses.REFUNDED_PARTIAL
    }

    try {
      await ctx.acquirerHandler.refundHandler(ctx)
    } catch (err) {
      // decorate and rethrow error
      err.data = {
        handler: ctx.acquirerHandler.name,
        handlerError: err.data || undefined
      }
      throw err
    }

    await models.sequelize.transaction(async t => {
      ctx.transaction.changed('updatedAt', true)

      await ctx.transactionRefund.save({ transaction: t })
      await ctx.transaction.save({ transaction: t })

      await ctx.transaction.reload({ transaction: t })
      await ctx.transactionRefund.reload({ transaction: t })
    })

    ctx.result = {
      ...ctx.result,
      handler: ctx.acquirerHandler.name,
      handlerResponse: ctx.handlerResponse,
      handlerTimeMs: ctx.handlerTimeMs,
      handlerFailed: ctx.handlerFailed,

      /** Deprecated field */
      transactionId: ctx.transaction.id,
      transactionRefundId: ctx.transactionRefund,
      agentId: ctx.transaction.agentId,
      acquirerId: ctx.transaction.acquirerId,
      amount: ctx.transaction.amount,
      totalRefundAmount: ctx.transaction.get('totalRefundAmount'),
      refundAmount: ctx.transactionRefund.amount,
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
