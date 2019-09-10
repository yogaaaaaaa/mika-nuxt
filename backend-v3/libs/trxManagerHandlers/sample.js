'use strict'

/**
 * Sample acquirer handler
 * Provided as example and template
*/

module.exports = (trxManager) => {
  trxManager.acquirerHandlers.push({
    // Name to use this handler
    name: 'generic',

    // Default minimum of this acquirer
    defaultMinimumAmount: 1,

    // Default maximum of this acquirer
    defaultMaximumAmount: 1000000,

    // Classes for this handler. Classes is simple name for **certain** acquirer
    // Used mostly by frontend
    classes: ['generic', 'berkumapay'],

    // Contain array of acquirer flows, supported token types and userTokenTypes
    properties: {
      flows: [
        trxManager.transactionFlows.PROVIDE_TOKEN
      ],
      tokenTypes: [
        trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      ],
      userTokenTypes: []
    },

    // This handler will be called when new transaction instance is filled (but before its saved to database).
    // Expected to fill ctx.transaction.token and ctx.transaction.tokenType (or none if this Payment Provider does not provide one)
    // throw Error object (via trxManager.error) when something goes wrong
    async handler (ctx) {
      ctx.transaction.tokenType = trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      ctx.transaction.token = 'QRCODE-GENERIC'
    },

    async expiryHandler (ctx) {
    },

    async cancelHandler (ctx) {
    },

    async voidHandler (ctx) {
    },

    async checkHandler (ctx) {
    },

    async followUpHandler (ctx) {
    },

    async forceUpdateHandler (ctx) {
    }
  })
}
