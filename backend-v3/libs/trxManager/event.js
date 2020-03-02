'use strict'

const EventEmitter2 = require('eventemitter2').EventEmitter2
const events = new EventEmitter2()

const { eventTypes } = require('./constants')

/**
 * Emit transaction event (via EventEmitter2).
 */
module.exports.emitTransactionEvent = async (transaction, dbTransaction) => {
  try {
    await events.emitAsync(eventTypes.TRANSACTION_EVENT, {
      transactionId: transaction.id,
      transactionStatus: transaction.status,
      agentId: transaction.agentId,
      acquirerId: transaction.acquirerId,
      t: dbTransaction
    })
  } catch (err) {
    console.error(err)
  }
}

/**
 * Listen to transaction event (via EventEmitter2)
 */
module.exports.listenTransactionEvent = (handler) => {
  events.addListener(eventTypes.TRANSACTION_EVENT, handler)
}

/**
 * Emit settlement event (via EventEmitter2).
 */
module.exports.emitAgentSettleBatchEvent = async (settleBatch, dbTransaction) => {
  try {
    await events.emitAsync(eventTypes.SETTLE_BATCH_EVENT, {
      settleBatchId: settleBatch.id,
      settleBatchStatus: settleBatch.status,
      agentId: settleBatch.agentId,
      t: dbTransaction
    })
  } catch (err) {
    console.error(err)
  }
}

/**
 * Listen to settlement event (via EventEmitter2)
 */
module.exports.listenAgentSettleBatchEvent = (handler) => {
  events.addListener(eventTypes.SETTLE_BATCH_EVENT, handler)
}
