'use strict'

const tcash = require('../ppTcash')

/**
  * TCASH Payment gateway handler
  */

module.exports = (trxManager) => {
  trxManager.ppHandlers.push({
    name: 'tcash',
    classes: ['linkaja', 'tcash'],
    properties: {
      flows: [
        trxManager.transactionFlows.PROVIDE_TOKEN
      ],
      tokenTypes: [
        trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      ],
      userTokenTypes: []
    },
    async handler (config) {
      config.tokenType = trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      config.token = tcash.createQrCode({ transactionId: config.transaction.id })

      config.updatedTransaction = {
        tokenType: config.tokenType,
        token: config.token
      }
    }
  })
}
