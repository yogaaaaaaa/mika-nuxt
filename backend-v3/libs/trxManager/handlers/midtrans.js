'use strict'

/**
* MIDTRANS Gopay Acquirer handler
*/

const { createError } = require('libs/error')
const midtrans = require('libs/aqMidtrans')

const {
  errorTypes,
  transactionStatuses,
  transactionFlows,
  paymentClasses,
  tokenTypes
} = require('../constants')

function checkResponse (response) {
  if (!response) {
    throw createError({
      name: errorTypes.ACQUIRER_HOST_NO_RESPONSE,
      data: response
    })
  }

  if (response.status_code === '202') {
    throw createError({
      name: errorTypes.ACQUIRER_HOST_RESPONSE_ERROR,
      data: response
    })
  }

  if ((/^[35][0-9][0-9]$/).test(response.status_code)) {
    throw createError({
      name: errorTypes.ACQUIRER_HOST_RESPONSE_ERROR,
      data: response
    })
  }

  if (response.status_code === '412') {
    throw createError({
      name: errorTypes.INVALID_TRANSACTION_ON_ACQUIRER_HOST,
      data: response
    })
  }

  if (response.status_code === '414') {
    throw createError({
      name: errorTypes.INVALID_TRANSACTION_ON_ACQUIRER_HOST,
      data: response
    })
  }

  if ((/^[4][0-9][0-9]$/).test(response.status_code)) {
    throw createError({
      name: errorTypes.INVALID_ACQUIRER_CONFIG,
      data: response
    })
  }
}

module.exports = {
  name: midtrans.handlerName,
  classes: [
    paymentClasses.GOPAY
  ],
  defaultMinimumAmount: 1,
  defaultMaximumAmount: null,
  singleTransactionOnly: false,
  useTraceNumber: false,
  properties: {
    flows: [
      transactionFlows.PROVIDE_TOKEN,
      transactionFlows.REFUND,
      transactionFlows.PARTIAL_REFUND
    ],
    tokenTypes: [
      tokenTypes.TOKEN_QRCODE_URL_IMAGE
    ],
    userTokenTypes: []
  },
  async handler (ctx) {
    const midtransConfig = midtrans.mixConfig(ctx.acquirer.acquirerConfig.config)

    const response = await midtrans.gopayChargeRequest({
      order_id: ctx.transaction.id,
      gross_amount: ctx.transaction.amount,

      custom_field1: ctx.agent.outlet.merchant.name,
      custom_field2: ctx.agent.outlet.name,
      custom_field3: ctx.agent.outlet.city,

      ...midtransConfig
    })
    checkResponse(response)

    for (const action of response.actions) {
      if (action.name === 'generate-qr-code') {
        ctx.transaction.token = action.url
        ctx.transaction.tokenType = tokenTypes.TOKEN_QRCODE_URL_IMAGE
        break
      }
    }
    ctx.transaction.reference = response.transaction_id
    ctx.transaction.referenceName = 'transaction_id'
  },
  async expiryHandler (ctx) {
    const midtransConfig = midtrans.mixConfig(ctx.acquirer.acquirerConfig.config)

    const response = await midtrans.statusTransaction({
      order_id: ctx.transaction.id,
      ...midtransConfig
    })
    checkResponse(response)

    if (response.transaction_status === 'settlement') ctx.transaction.status = transactionStatuses.SUCCESS

    if (
      ctx.transaction.status === transactionStatuses.FAILED ||
        ctx.transaction.status === transactionStatuses.EXPIRED
    ) {
      await midtrans.expireTransaction({
        order_id: ctx.transaction.id,
        ...midtransConfig
      })
    }
  },
  async cancelHandler (ctx) {
    const midtransConfig = midtrans.mixConfig(ctx.acquirer.acquirerConfig.config)

    const response = await midtrans.cancelTransaction({
      order_id: ctx.transaction.id,
      ...midtransConfig
    })
    checkResponse(response)
  },
  async refundHandler (ctx) {
    const midtransConfig = midtrans.mixConfig(ctx.acquirer.acquirerConfig.config)

    const response = await midtrans.directRefundTransaction({
      order_id: ctx.transaction.id,
      amount: ctx.transactionRefund.amount,
      reason: ctx.transactionRefund.reason,
      refund_key: ctx.transactionRefund.id,
      ...midtransConfig
    })

    checkResponse(response)
  },
  async forceStatusUpdateHandler (ctx) {
    if (ctx.newTransactionStatus !== transactionStatuses.SUCCESS) return

    const midtransConfig = midtrans.mixConfig(ctx.acquirer.acquirerConfig.config)

    const sandboxPaySuccess = await midtrans.gopaySandboxPay({
      qrCodeUrl: ctx.transaction.token,
      ...midtransConfig
    })

    if (sandboxPaySuccess) {
      ctx.acquirerHostDoUpdate = true
    }
  }
}
