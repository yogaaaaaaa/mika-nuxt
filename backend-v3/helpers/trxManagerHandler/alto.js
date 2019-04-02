'use strict'

const alto = require('../ppAlto')

/**
* ALTO Payment gateway handler
*/
module.exports = (trxManager) => {
  trxManager.ppHandlers.push({
    name: 'alto',
    alias: ['wechatpay', 'alipay'],
    properties: [
      trxManager.transactionFlow.PROVIDE_TOKEN,
      trxManager.transactionFlow.GET_TOKEN,
      trxManager.tokenType.TOKEN_QRCODE_URL_IMAGE,
      trxManager.userTokenType.USER_TOKEN_QRCODE_CONTENT
    ],
    async handler (config) {
      let altoResponse = await alto.altoMakeQrCodePayment({
        out_trade_no: config.transaction.id,
        subject: `MIKA Payment ${config.transaction.id}`,
        amount: config.transaction.amount
      })

      if (!altoResponse) {
        return true
      }

      config.token = altoResponse.uri
      config.tokenType = trxManager.tokenType.TOKEN_QRCODE_CONTENT

      config.updatedTransaction = {
        referenceNumber: altoResponse.out_trade_no,
        referenceNumberType: 'out_trade_no',
        token: config.token,
        tokenType: config.tokenType
      }
    }
  })
}