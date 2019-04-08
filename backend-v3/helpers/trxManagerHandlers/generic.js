'use strict'

/**
 * Generic payment provider handler
 * Provided as example and template
*/

module.exports = (trxManager) => {
  trxManager.ppHandlers.push({
    // Name to use this handler
    name: 'generic',

    // Alias for this handler. Alias is simple name for **certain** payment provider
    // Used mostly by frontend
    classes: ['generic', 'berkumapay'],

    // properties contain comma delimited list that define various things like
    // what kind of token this Payment provider wants or generate
    properties: {
      flows: [trxManager.transactionFlows.PROVIDE_TOKEN],
      tokenTypes: [trxManager.tokenTypes.TOKEN_QRCODE_CONTENT],
      userTokenTypes: []
    },

    // This handler will be called BEFORE transaction data is created in database
    // Use this for checking of required parameter for this payment gateway
    // return true or error object ( {error: ERROR_CODE} ) if something goes wrong
    async preHandler (config) {
    },

    // This handler will be called AFTER transaction data is created in database.
    // Expected to fill config.token (or none if this Payment Provider does not provide one)
    // return true or error object ( {error: ERROR_CODE} ) if something goes wrong
    async handler (config) {
      config.tokenType = trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      config.token = 'QRCODE-GENERIC'
    },

    // This handler will be called when transaction is timed out BEFORE transaction data is UPDATED in database
    async timeoutHandler (config) {
    },

    // This handler will be called when transaction is timed out AFTER transaction data is UPDATED in database
    async timeoutPostHandler (config) {
    },

    // Define any post action here
    async postAction (config) {
    }
  })
}
