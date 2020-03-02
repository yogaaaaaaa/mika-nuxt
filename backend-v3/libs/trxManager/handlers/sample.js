'use strict'

/**
 * Sample acquirer handler
 * Provided as example and template
*/

const {
  transactionFlows,
  paymentClasses,
  tokenTypes
} = require('../constants')

module.exports = {
  // Name to use this handler
  name: 'sample',

  // Default minimum of this acquirer
  defaultMinimumAmount: 1,

  // Default maximum of this acquirer
  defaultMaximumAmount: 1000000,

  // Classes for this handler. Classes is simple name for **certain** payment method
  // Used mostly by frontend
  classes: [paymentClasses.KUMAPAY],

  // Only single active transaction is allowed per acquirer config and agent
  singleTransactionOnly: false,

  // This handler need agent-wide trace number
  useTraceNumber: false,

  // Contain array of acquirer flows, supported token types and userTokenTypes
  properties: {
    flows: [
      transactionFlows.PROVIDE_TOKEN
    ],
    tokenTypes: [
      tokenTypes.TOKEN_QRCODE_CONTENT
    ],
    userTokenTypes: []
  },

  // This handler will be called when new transaction instance is filled (but before its saved to database).
  // Expected to fill ctx.transaction.token and ctx.transaction.tokenType (or none if this Payment Provider does not provide one)
  // throw Error object (via error) when something goes wrong
  async handler (ctx) {
    ctx.transaction.tokenType = tokenTypes.TOKEN_QRCODE_CONTENT
    ctx.transaction.token = 'QRCODE-GENERIC'
  },

  async redirectHandler (ctx) {
  },

  async expiryHandler (ctx) {
  },

  async cancelHandler (ctx) {
  },

  async reverseHandler (ctx) {
  },

  async voidHandler (ctx) {
  },

  async checkHandler (ctx) {
  },

  async followUpHandler (ctx) {
  },

  async forceStatusUpdateHandler (ctx) {
  }
}
