'use strict'

/**
* MIDTRANS Gopay Acquirer handler
*/

const midtrans = require('../aqMidtrans')

module.exports = (trxManager) => {
  const checkResponse = (response) => {
    if (!response) {
      throw trxManager.error(trxManager.errorTypes.ACQUIRER_HOST_UNAVAILABLE)
    }

    if (response.status_code === '202') {
      throw trxManager.error(trxManager.errorTypes.ACQUIRER_HOST_UNABLE_TO_PROCESS)
    }

    if (response.status_code === '412') {
      throw trxManager.error(trxManager.errorTypes.INVALID_TRANSACTION_ON_ACQUIRER_HOST)
    }

    if ((/^[4][0-9][0-9]$/).test(response.status_code)) {
      throw trxManager.error(trxManager.errorTypes.INVALID_ACQUIRER_CONFIG)
    }

    if ((/^[35][0-9][0-9]$/).test(response.status_code)) {
      throw trxManager.error(trxManager.errorTypes.ACQUIRER_HOST_UNAVAILABLE)
    }
  }

  trxManager.acquirerHandlers.push({
    name: midtrans.handlerName,
    classes: midtrans.handlerClasses,
    defaultMinimumAmount: 1,
    defaultMaximumAmount: null,
    properties: {
      flows: [
        trxManager.transactionFlows.PROVIDE_TOKEN,
        trxManager.transactionFlows.REFUND,
        trxManager.transactionFlows.PARTIAL_REFUND
      ],
      tokenTypes: [
        trxManager.tokenTypes.TOKEN_QRCODE_URL_IMAGE
      ],
      userTokenTypes: []
    },
    async handler (ctx) {
      let midtransConfig = midtrans.mixConfig(ctx.acquirer.acquirerConfig.config)

      let response = await midtrans.gopayChargeRequest({
        order_id: ctx.transaction.id,
        gross_amount: ctx.transaction.amount,

        custom_field1: ctx.agent.outlet.merchant.name,
        custom_field2: ctx.agent.outlet.name,
        custom_field3: ctx.agent.outlet.city,

        ...midtransConfig
      })
      checkResponse(response)

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
        order_id: ctx.transaction.id,
        ...midtransConfig
      })
      checkResponse(response)

      if (response.transaction_status === 'settlement') ctx.transaction.status = trxManager.transactionStatuses.SUCCESS

      if (
        ctx.transaction.status === trxManager.transactionStatuses.FAILED ||
        ctx.transaction.status === trxManager.transactionStatuses.EXPIRED
      ) {
        await midtrans.expireTransaction({
          order_id: ctx.transaction.id,
          ...midtransConfig
        })
      }
    },
    async cancelHandler (ctx) {
      let midtransConfig = midtrans.mixConfig(ctx.acquirer.acquirerConfig.config)

      let response = await midtrans.cancelTransaction({
        order_id: ctx.transaction.id,
        ...midtransConfig
      })
      checkResponse(response)
    },
    async refundHandler (ctx) {
      let midtransConfig = midtrans.mixConfig(ctx.acquirer.acquirerConfig.config)

      let response = await midtrans.directRefundTransaction({
        order_id: ctx.transaction.id,
        amount: ctx.transactionRefund.amount,
        reason: ctx.transactionRefund.reason,
        refund_key: ctx.transactionRefund.id,
        ...midtransConfig
      })

      if (response.status_code === '414') {
        throw trxManager.error(trxManager.errorTypes.INVALID_TRANSACTION_ON_ACQUIRER_HOST)
      }

      checkResponse(response)
    },
    async forceStatusUpdateHandler (ctx) {
      if (ctx.newTransactionStatus !== trxManager.transactionStatuses.SUCCESS) return

      const midtransConfig = midtrans.mixConfig(ctx.acquirer.acquirerConfig.config)

      let sandboxPaySuccess = await midtrans.gopaySandboxPay({
        qrCodeUrl: ctx.transaction.token,
        ...midtransConfig
      })

      if (sandboxPaySuccess) {
        ctx.acquirerHostDoUpdate = true
      }
    }
  })
}
