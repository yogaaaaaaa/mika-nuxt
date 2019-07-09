'use strict'

/**
* MIDTRANS Gopay Acquirer handler
*/

const midtrans = require('../aqMidtrans')

module.exports = (trxManager) => {
  trxManager.acquirerHandlers.push({
    name: midtrans.handlerName,
    classes: midtrans.handlerClasses,
    defaultMinimumAmount: 1,
    defaultMaximumAmount: null,
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
      let midtransConfig = midtrans.mixConfig(ctx.acquirer.acquirerConfig.config)

      let response = await midtrans.gopayChargeRequest({
        order_id: ctx.transaction.idAlias,
        gross_amount: ctx.transaction.amount,
        ...midtransConfig
      })

      if (!response) {
        throw trxManager.error(trxManager.errorTypes.ACQUIRER_NOT_RESPONDING)
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
    async expiryHandler (ctx) {
      let midtransConfig = midtrans.mixConfig(ctx.acquirer.acquirerConfig.config)

      let response = await midtrans.statusTransaction({
        order_id: ctx.transaction.idAlias,
        gross_amount: ctx.transaction.amount,
        ...midtransConfig
      })

      if (!response) {
        throw trxManager.error(trxManager.errorTypes.ACQUIRER_NOT_RESPONDING)
      }

      if (
        response.transaction_status === 'settlement' &&
        response.payment_type === midtrans.handlerName &&
        parseInt(ctx.transaction.amount) === parseInt(ctx.response.gross_amount)
      ) {
        if (response.transaction_status === 'settlement') {
          ctx.transaction.status = trxManager.transactionStatuses.SUCCESS
        }
      }

      await ctx.transaction.save()

      if (ctx.transaction.status === trxManager.transactionStatuses.FAILED) {
        await midtrans.expireTransaction({
          order_id: ctx.transaction.idAlias,
          ...midtransConfig
        })
      }
    }
  })
}
