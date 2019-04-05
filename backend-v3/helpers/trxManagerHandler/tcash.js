'use strict'

const tcash = require('../ppTcash')

/**
  * TCASH Payment gateway handler
  */

module.exports = (trxManager) => {
  trxManager.ppHandlers.push({
    name: 'tcash',
    classes: ['linkaja', 'tcash'],
    properties: [
      trxManager.transactionFlows.PROVIDE_TOKEN,
      trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
    ],
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
