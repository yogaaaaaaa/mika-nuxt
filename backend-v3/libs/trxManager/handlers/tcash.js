'use strict'

/**
 * Tcash/LinkAja Acquirer handler
 */

const tcash = require('libs/aqTcash')

const {
  transactionFlows,
  paymentClasses,
  tokenTypes
} = require('../constants')

module.exports = {
  name: tcash.handlerName,
  classes: [
    paymentClasses.TCASH,
    paymentClasses.LINKAJA
  ],
  defaultMinimumAmount: 100,
  defaultMaximumAmount: null,
  singleTransactionOnly: false,
  useTraceNumber: false,
  properties: {
    flows: [
      transactionFlows.PROVIDE_TOKEN
    ],
    tokenTypes: [
      tokenTypes.TOKEN_QRCODE_CONTENT
    ],
    userTokenTypes: []
  },
  async handler (ctx) {
    ctx.transaction.tokenType = tokenTypes.TOKEN_QRCODE_CONTENT
    ctx.transaction.token = tcash.createQrCode({
      acc_no: ctx.transaction.id,
      ...tcash.mixConfig(ctx.acquirer.acquirerConfig.config)
    })
  }
}
