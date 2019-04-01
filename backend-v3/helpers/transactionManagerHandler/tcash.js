'use strict'

const tcash = require('../pgTcash')

module.exports = (transactionManager) => {
  /**
  * TCASH Payment gateway handler
  */
  transactionManager.pgHandlers.push({
    alias: ['tcash', 'linkaja'],
    properties: 'provideToken,tokenQrCodeContent',
    tokenParam: {
      pgType: null,
      tokenType: transactionManager.tokenType.TOKEN_QRCODE_CONTENT,
      userTokenType: null
    },
    handler: async (config) => {
      config.transactionToken = {
        type: transactionManager.tokenType.TOKEN_QRCODE_CONTENT,
        token: tcash.createQrCode({ transactionId: config.transactionData.id })
      }

      config.transactionDataUpdated = {
        qrcode: config.transactionToken.token
      }
    }
  })
}
