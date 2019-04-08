'use strict'

const alto = require('../ppAlto')

/**
* ALTO Payment provider handler
*/
module.exports = (trxManager) => {
  trxManager.ppHandlers.push({
    name: 'alto',
    classes: ['wechatpay', 'alipay'],
    properties: {
      flows: [
        trxManager.transactionFlows.GET_TOKEN,
        trxManager.transactionFlows.PROVIDE_TOKEN
      ],
      tokenTypes: [
      ],
      userTokenTypes: [
        trxManager.tokenTypes.USER_TOKEN_QRCODE_CONTENT
      ]
    },
    async handler (config) {
      let response = await alto.altoMakeQrCodePayment(Object.assign({
        out_trade_no: config.transaction.id,
        subject: `MIKA Payment ${config.transaction.id}`,
        amount: config.transaction.amount
      }, config.paymentProvider.paymentProviderConfig.config))

      if (!response) return true

      config.token = response.uri
      config.tokenType = trxManager.tokenTypes.TOKEN_QRCODE_CONTENT

      config.updatedTransaction = {
        referenceNumber: response.out_trade_no,
        referenceNumberType: 'out_trade_no',
        token: config.token,
        tokenType: config.tokenType
      }
    }
  })
}
