'use strict'

const tcash = require('../ppTcash')

/**
  * TCASH Payment gateway handler
  */

module.exports = (trxManager) => {
  trxManager.ppHandlers.push({
    name: 'tcash',
    alias: ['linkaja', 'tcash'],
    properties: 'provideToken,tokenQrCodeContent',
    async handler (config) {
      config.tokenType = trxManager.tokenType.TOKEN_QRCODE_CONTENT
      config.token = tcash.createQrCode({ transactionId: config.transactionData.id })

      config.transactionDataUpdated = {
        tokenType: config.tokenType,
        token: config.token
      }
    }
  })
}
