'use strict'

/**
* ALTO Payment provider handler
*/

const alto = require('../ppAlto')

module.exports = (trxManager) => {
  trxManager.ppHandlers.push({
    name: alto.handlerName,
    classes: alto.handlerClasses,
    defaultMinimumAmount: 1000,
    defaultMaximumAmount: 20000000,
    properties: {
      flows: [
        trxManager.transactionFlows.GET_TOKEN
      ],
      tokenTypes: [
        trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      ],
      userTokenTypes: [
      ]
    },
    async handler (ctx) {
      let altoConfig = alto.mixConfig(ctx.paymentProvider.paymentProviderConfig.config)

      let response = await alto.altoMakeQrCodePayment(Object.assign({
        out_trade_no: ctx.transaction.id,
        subject: 'MIKA Payment',
        amount: ctx.transaction.amount
      }, altoConfig))

      if (!response) throw trxManager.error(trxManager.errorTypes.PAYMENT_PROVIDER_NOT_RESPONDING)

      ctx.transaction.token = response.uri
      ctx.transaction.tokenType = trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      ctx.transaction.referenceNumber = response.trade_no
      ctx.transaction.referenceNumberName = 'trade_no'
    }
  })
}
