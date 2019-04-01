'use strict'

/**
 * Generic payment provider handler
 * Provided as example and template
*/

module.exports = (transactionManager) => {
  transactionManager.pgHandlers.push({
    // Name to use this handler
    name: 'generic',

    // Alias for this handler. Alias is simple name for **certain** payment provider
    // Used mostly by frontend
    alias: ['generic', 'supaPaymentProvider'],

    // properties contain comma delimited list that define various things like
    // what kind of token this Payment gateway wants or generate
    properties: 'provideToken,tokenQrCodeContent',

    // This handler will be called BEFORE transaction data is created in database
    // Use this for checking of required parameter for this payment gateway
    // return true or error object ( {error: ERROR_CODE} ) if something goes wrong
    async preHandler (config) {
    },

    // This handler will be called AFTER transaction data is created in database
    // Expected to fill config.transactionToken (or none if this PG does not provide one)
    // return true or error object ( {error: ERROR_CODE} ) if something goes wrong
    async handler (config) {
      config.tokenType = transactionManager.tokenType.TOKEN_QRCODE_CONTENT
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
