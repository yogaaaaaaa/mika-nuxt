'use strict'

/**
* Kuma Pay Acquirer Handler - a qr payment provider for development environment
*/

const timer = require('libs/timer')
const { createError } = require('libs/error')
const uid = require('libs/uid')

const {
  errorTypes,
  transactionFlows,
  paymentClasses,
  tokenTypes
} = require('../constants')

module.exports = {
  // Name to use this handler
  name: 'kumapay',
  classes: [
    paymentClasses.KUMAPAY
  ],
  defaultMinimumAmount: 1,
  defaultMaximumAmount: null,
  singleTransactionOnly: false,
  useTraceNumber: false,
  properties: {
    flows: [
      transactionFlows.PROVIDE_TOKEN,
      transactionFlows.REFUND,
      transactionFlows.PARTIAL_REFUND
    ],
    tokenTypes: [
      tokenTypes.TOKEN_QRCODE_CONTENT
    ],
    userTokenTypes: []
  },
  async handler (ctx) {
    // Random delay
    await timer.delay(100 + Math.random() * 3000)
    ctx.transaction.tokenType = tokenTypes.TOKEN_QRCODE_CONTENT
    ctx.transaction.token = `berkuma-${ctx.transaction.amount}-${(await uid.ksuid.random()).string}`
  },
  async expiryHandler (ctx) {
  },
  async cancelHandler (ctx) {
  },
  async refundHandler (ctx) {
    // Random delay
    await timer.delay(100 + Math.random() * 3000)
    ctx.transactionRefund.reference = `ref-${ctx.transactionRefund.id}`
    ctx.transactionRefund.referenceName = 'refund_key'
    // Throw probability of error
    if (Math.random() >= 0.8) {
      throw createError({
        name: errorTypes.ACQUIRER_HOST_RESPONSE_ERROR
      })
    }
  },
  async forceStatusUpdateHandler (ctx) {
  }
}
