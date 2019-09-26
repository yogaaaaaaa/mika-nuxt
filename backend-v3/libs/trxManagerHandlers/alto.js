'use strict'

/**
* ALTO Acquirer handler
*/

const alto = require('../aqAlto')

module.exports = (trxManager) => {
  trxManager.acquirerHandlers.push({
    name: alto.handlerName,
    classes: alto.handlerClasses,
    defaultMinimumAmount: 1000,
    defaultMaximumAmount: 20000000,
    properties: {
      flows: [
        trxManager.transactionFlows.PROVIDE_TOKEN
      ],
      tokenTypes: [
        trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
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

      if (!response) throw trxManager.error(trxManager.errorTypes.ACQUIRER_HOST_UNAVAILABLE)

      ctx.transaction.token = response.uri
      ctx.transaction.tokenType = trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      ctx.transaction.referenceNumber = response.trade_no
      ctx.transaction.referenceNumberName = 'trade_no'
    }
  })
}
