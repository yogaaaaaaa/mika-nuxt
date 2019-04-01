'use strict'

const alto = require('../ppAlto')

module.exports = (transactionManager) => {
  /**
  * ALTO Payment gateway handler
  */
  transactionManager.pgHandlers.push({
    name: 'alto',
    alias: ['wechatpay', 'alipay'],
    properties: 'provideToken,takeUserToken,tokenQrCodeContent,userTokenQrCodeContent',
    async handler (config) {
      let altoResponse = await alto.altoMakeQrCodePayment({
        out_trade_no: config.transactionData.id,
        subject: `MIKA Payment ${config.transactionData.id}`,
        amount: config.transactionData.amount
      })

      if (!altoResponse) {
        return true
      }

      config.transactionToken = {
        type: transactionManager.tokenType.TOKEN_QRCODE_CONTENT,
        token: altoResponse.uri
      }

      config.transactionDataUpdated = {
        reference_number: altoResponse.out_trade_no,
        qrcode: config.transactionToken.token
      }
    }
  })
}
