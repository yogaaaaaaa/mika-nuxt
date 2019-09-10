'use strict'

/**
* Tcash - National QR Code version
*/

const tcashQrn = require('../aqTcashQrn')

module.exports = (trxManager) => {
  const checkResponse = (response) => {
    if (!response) {
      throw trxManager.error(trxManager.errorTypes.ACQUIRER_HOST_UNAVAILABLE)
    }

    if (response.responseCode === '05') {
      throw trxManager.error(trxManager.errorTypes.ACQUIRER_HOST_UNAVAILABLE)
    }

    if (response.responseCode === '02') {
      throw trxManager.error(trxManager.errorTypes.INVALID_TRANSACTION_ON_ACQUIRER_HOST)
    }

    if (['01', '03'].includes(response.responseCode)) {
      throw trxManager.error(trxManager.errorTypes.INVALID_ACQUIRER_CONFIG)
    }
  }

  trxManager.acquirerHandlers.push({
    name: tcashQrn.handlerName,
    classes: tcashQrn.handlerClasses,
    defaultMinimumAmount: 100,
    defaultMaximumAmount: null,
    properties: {
      flows: [
        trxManager.transactionFlows.PROVIDE_TOKEN
      ],
      tokenTypes: [
        trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      ],
      userTokenTypes: []
    },
    async handler (ctx) {
      let tcashQrnConfig = tcashQrn.mixConfig(ctx.acquirer.acquirerConfig.config)

      let response = await tcashQrn.generateTcashNationalQr({
        merchantTrxID: ctx.transaction.id,
        amount: ctx.transaction.amount,
        fee: 0,

        merchantName: ctx.agent.outlet.name,
        city: ctx.agent.outlet.city,
        postalCode: ctx.agent.outlet.postalCode,

        ...tcashQrnConfig
      })
      checkResponse(response)

      ctx.transaction.tokenType = trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      ctx.transaction.token = response.qrString
    }
  })
}
