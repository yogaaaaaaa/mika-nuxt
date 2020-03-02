'use strict'

/**
 * Provide all functionality to create transaction in mika system.
 * Its also provide constant related transaction object
 */

const handlers = require('./handlers')

const config = require('configs/trxManagerConfig')
module.exports.config = config

const constants = require('./constants')
module.exports.constants = constants
module.exports.transactionStatuses = constants.transactionStatuses
module.exports.settleBatchStatuses = constants.settleBatchStatuses
module.exports.tokenTypes = constants.tokenTypes
module.exports.userTokenTypes = constants.userTokenTypes
module.exports.transactionFlags = constants.transactionFlags
module.exports.transactionFlows = constants.transactionFlows
module.exports.eventTypes = constants.eventTypes
module.exports.errorTypes = constants.errorTypes
module.exports.paymentClasses = constants.paymentClasses

module.exports.acquirerHandlers = handlers.acquirerHandlers
module.exports.formatAcquirerInfo = handlers.formatAcquirerInfo
module.exports.getAcquirerInfo = handlers.getAcquirerInfo

const event = require('./event')
module.exports.emitTransactionEvent = event.emitTransactionEvent
module.exports.listenTransactionEvent = event.listenTransactionEvent

module.exports.emitAgentSettleBatchEvent = event.emitAgentSettleBatchEvent
module.exports.listenAgentSettleBatchEvent = event.listenAgentSettleBatchEvent

module.exports.create = require('./actions/create').create
module.exports.reverse = require('./actions/reverse').reverse
module.exports.void = require('./actions/void').void
module.exports.refund = require('./actions/refund').refund
module.exports.forceStatusUpdate = require('./actions/forceStatusUpdate').forceStatusUpdate
module.exports.agentSettle = require('./actions/agentSettle').agentSettle
module.exports.agentSettleAsync = require('./actions/agentSettle').agentSettleAsync
module.exports.check = null
module.exports.followUp = null

// Load all acquirer handler
handlers.loadHandlers(exports)
