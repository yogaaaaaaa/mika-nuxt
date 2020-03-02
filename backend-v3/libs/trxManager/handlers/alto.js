'use strict'

/**
* ALTO Acquirer handler
*/

const { createError } = require('libs/error')
const alto = require('libs/aqAlto')

const {
  errorTypes,
  transactionFlows,
  paymentClasses,
  tokenTypes
} = require('../constants')

module.exports = {
  name: alto.handlerName,
  classes: [
    paymentClasses.ALIPAY,
    paymentClasses.WECHATPAY
  ],
  defaultMinimumAmount: 1000,
  defaultMaximumAmount: 20000000,
  singleTransactionOnly: false,
  useTraceNumber: false,
  properties: {
    flows: [
      transactionFlows.PROVIDE_TOKEN
    ],
    tokenTypes: [
      tokenTypes.TOKEN_QRCODE_CONTENT
    ],
    userTokenTypes: [
    ]
  },
  async handler (ctx) {
    const altoConfig = alto.mixConfig(ctx.acquirer.acquirerConfig.config)

    const response = await alto.altoMakeQrCodePayment({
      out_trade_no: ctx.transaction.id,
      subject: 'MIKA Payment',
      amount: ctx.transaction.amount,
      ...altoConfig
    })

    if (!response) {
      throw createError({
        name: errorTypes.ACQUIRER_HOST_NO_RESPONSE
      })
    }

    ctx.transaction.token = response.uri
    ctx.transaction.tokenType = tokenTypes.TOKEN_QRCODE_CONTENT
    ctx.transaction.reference = response.trade_no
    ctx.transaction.referenceName = 'trade_no'
  }
}
