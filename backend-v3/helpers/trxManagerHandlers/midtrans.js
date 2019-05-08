'use strict'

/**
* MIDTRANS Gopay Payment provider handler
*/

const midtrans = require('../ppMidtrans')

module.exports = (trxManager) => {
  trxManager.ppHandlers.push({
    name: 'midtrans',
    classes: ['gopay'],
    defaultMinimum: 1,
    properties: {
      flows: [
        trxManager.transactionFlows.PROVIDE_TOKEN
      ],
      tokenTypes: [
        trxManager.tokenTypes.TOKEN_QRCODE_URL_IMAGE
      ],
      userTokenTypes: []
    },
    async handler (ctx) {
      let midtransConfig = midtrans.mixConfig(ctx.paymentProvider.paymentProviderConfig.config)

      let response = await midtrans.gopayChargeRequest(Object.assign({
        order_id: ctx.transaction.id,
        gross_amount: ctx.transaction.amount
      }, midtransConfig))

      if (!response) {
        throw trxManager.error(trxManager.errorTypes.PAYMENT_PROVIDER_NOT_RESPONDING)
      }

      for (let action of response.actions) {
        if (action.name === 'generate-qr-code') {
          ctx.transaction.token = action.url
          ctx.transaction.tokenType = trxManager.tokenTypes.TOKEN_QRCODE_URL_IMAGE
          break
        }
      }
      ctx.transaction.referenceNumber = response.transaction_id
      ctx.transaction.referenceNumberName = 'transaction_id'
    },
    async timeoutHandler (ctx) {
      let midtransConfig = midtrans.mixConfig(ctx.paymentProvider.paymentProviderConfig.config)

      let response = await midtrans.statusTransaction(Object.assign({
        order_id: ctx.transaction.id,
        gross_amount: ctx.transaction.amount
      }, midtransConfig))

      if (!response) {
        throw trxManager.error(trxManager.errorTypes.PAYMENT_PROVIDER_NOT_RESPONDING)
      }

      if (
        response.transaction_status === 'settlement' &&
        response.payment_type === 'gopay' &&
        parseInt(ctx.transaction.amount) === parseInt(ctx.response.gross_amount)
      ) {
        if (response.transaction_status === 'settlement') {
          ctx.transaction.status = trxManager.transactionStatuses.SUCCESS
        }
      }

      await ctx.transaction.save()

      if (ctx.transaction.status === trxManager.transactionStatuses.FAILED) {
        await midtrans.expireTransaction(Object.assign({
          order_id: ctx.transaction.id
        }, midtransConfig))
      }
    }
  })
}
