'use strict'

/**
* MIDTRANS Gopay Payment gateway handler
*/

const midtrans = require('../ppMidtrans')

module.exports = (transactionManager) => {
  transactionManager.pgHandlers.push({
    name: 'midtrans',
    alias: ['gopay'],
    properties: 'provideToken,tokenQrCodeUrlImage',
    async handler (config) {
      let response = await midtrans.gopayChargeRequest({
        order_id: config.transactionData.id,
        amount: config.transactionData.amount
      })

      if (!response) {
        return true
      }

      for (let action of response.actions) {
        if (action.name === 'generate-qr-code') {
          config.transactionToken = {
            type: transactionManager.tokenType.TOKEN_QRCODE_URL_IMAGE,
            token: action.url
          }
          break
        }
      }

      config.transactionDataUpdated = {
        reference_number: response.transactionId,
        midtrans_qrcode: config.transactionToken.token
      }
    },
    async timeoutHandler (config) {
      config.midtransResponse = await midtrans.statusTransaction({
        order_id: config.transactionData.id
      })

      if (!config.midtransResponse) {
        return
      }

      if (
        config.midtransResponse.payment_type === 'gopay' &&
        parseInt(config.transactionData.amount) === parseInt(config.midtransResponse.gross_amount)
      ) {
        if (config.midtransResponse.transaction_status === 'settlement') {
          config.transactionDataUpdated = {
            transaction_status_id: transactionManager.transactionStatus.SUCCESS.id
          }
        }
      }
    },
    async timeoutPostHandler (config) {
      if (!config.midtransResponse) {
        return
      }

      if (config.transactionDataUpdated.transaction_status_id === transactionManager.transactionStatus.FAILED.id) {
        await midtrans.expireTransaction({
          order_id: config.transactionData.id
        })
      }
    }
  })
}
