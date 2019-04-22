'use strict'

/**
* ALTO Payment provider handler
*/

const alto = require('../ppAlto')

module.exports = (trxManager) => {
  trxManager.ppHandlers.push({
    name: 'alto',
    classes: ['wechatpay', 'alipay'],
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
      let response = await alto.altoMakeQrCodePayment(Object.assign({
        out_trade_no: ctx.transaction.id,
        subject: 'MIKA Payment',
        amount: ctx.transaction.amount
      }, ctx.paymentProvider.paymentProviderConfig.config))

      if (!response) throw trxManager.error(trxManager.errorCodes.PAYMENT_PROVIDER_NOT_RESPONDING)

      ctx.transaction.token = response.uri
      ctx.transaction.tokenType = trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      ctx.transaction.referenceNumber = response.trade_no
      ctx.transaction.referenceNumberName = 'trade_no'
    }
  })
}
