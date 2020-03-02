'use strict'

const models = require('models')
const dTimer = require('libs/dTimer')

const event = require('../event')
const ctxTrx = require('../ctxHelpers/ctxTrx')
const { eventTypes, transactionStatuses } = require('../constants')

/**
 * Handle event from dTimer
 */
dTimer.handleEvent(async (eventCtx) => {
  try {
    if (eventCtx.event === eventTypes.TRANSACTION_EXPIRY) {
      const ctx = await ctxTrx.init({
        buildOptions: {
          transactionId: eventCtx.transactionId
        }
      })
      await ctxTrx.buildForExistingTransaction(ctx)

      if (ctx.transaction.status === transactionStatuses.CREATED) {
        ctx.transaction.status = transactionStatuses.EXPIRED

        if (typeof ctx.acquirerHandler.expiryHandler === 'function') {
          await ctx.acquirerHandler.expiryHandler(ctx)
        }

        await models.sequelize.transaction(async t => {
          await ctx.transaction.save({ transaction: t })
          await event.emitTransactionEvent(ctx.transaction, t)
        })
      }

      return true
    }
  } catch (err) {
    console.error(err)
  }
})

/**
 * Create expiry for created transaction
 */
module.exports.expiry = async ({
  transactionId,
  expiryTime
}) => {
  await dTimer.postEvent({
    id: `trx-${transactionId}`,
    event: eventTypes.TRANSACTION_EXPIRY,
    transactionId
  }, expiryTime)
}
