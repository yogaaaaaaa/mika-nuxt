'use strict'

/**
* Kuma Pay Acquirer Handler - a test payment provider for development environment
*/

const uid = require('../uid')

module.exports = (trxManager) => {
  trxManager.acquirerHandlers.push({
    name: 'kumapay',
    classes: [ 'kumapay' ],
    defaultMinimumAmount: 1,
    defaultMaximumAmount: null,
    properties: {
      flows: [
        trxManager.transactionFlows.PROVIDE_TOKEN,
        trxManager.transactionFlows.REFUND,
        trxManager.transactionFlows.PARTIAL_REFUND
      ],
      tokenTypes: [
        trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      ],
      userTokenTypes: []
    },
    async handler (ctx) {
      ctx.transaction.tokenType = trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      ctx.transaction.token = `berkuma-${ctx.transaction.amount}-${(await uid.ksuid.random()).string}`
    },
    async expiryHandler (ctx) {
    },
    async cancelHandler (ctx) {
    },
    async refundHandler (ctx) {
      ctx.transactionRefund.reference = `ref-${ctx.transactionRefund.id}`
      ctx.transactionRefund.referenceName = 'refund_key'
      // Throw probability of error
      if (Math.random() >= 0.8) {
        throw trxManager.error(trxManager.errorTypes.ACQUIRER_HOST_UNABLE_TO_PROCESS)
      }
    },
    async forceStatusUpdateHandler (ctx) {
    }
  })
}
