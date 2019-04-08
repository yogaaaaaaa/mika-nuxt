'use strict'

/**
* MIDTRANS Gopay Payment provider handler
*/

const midtrans = require('../ppMidtrans')

module.exports = (trxManager) => {
  trxManager.ppHandlers.push({
    name: 'midtrans',
    classes: ['gopay'],
    properties: {
      flows: [
        trxManager.transactionFlows.PROVIDE_TOKEN
      ],
      tokenTypes: [
        trxManager.tokenTypes.TOKEN_QRCODE_URL_IMAGE
      ],
      userTokenTypes: []
    },
    async handler (config) {
      let response = await midtrans.gopayChargeRequest(Object.assign({
        order_id: config.transaction.id,
        amount: config.transaction.amount
      }, config.paymentProvider.paymentProviderConfig.config))

      if (!response) return true

      for (let action of response.actions) {
        if (action.name === 'generate-qr-code') {
          config.token = action.url
          config.tokenType = trxManager.tokenTypes.TOKEN_QRCODE_URL_IMAGE
          break
        }
      }

      config.updatedTransaction = {
        referenceNumber: response.transaction_id,
        referenceNumberType: 'transaction_id',
        token: config.token,
        tokenType: config.tokenType
      }
    },
    async timeoutHandler (config) {
      config.midtransResponse = await midtrans.statusTransaction({
        order_id: config.transaction.id
      })

      if (!config.midtransResponse) {
        return
      }

      if (
        config.midtransResponse.payment_type === 'gopay' &&
        parseInt(config.transaction.amount) === parseInt(config.midtransResponse.gross_amount)
      ) {
        if (config.midtransResponse.transaction_status === 'settlement') {
          config.updatedTransaction = {
            transactionStatus: trxManager.transactionStatuses.SUCCESS
          }
        }
      }
    },
    async timeoutPostHandler (config) {
      if (!config.midtransResponse) {
        return
      }

      if (config.updatedTransaction.transactionStatus === trxManager.transactionStatuses.FAILED) {
        await midtrans.expireTransaction({
          order_id: config.transaction.id
        })
      }
    }
  })
}
