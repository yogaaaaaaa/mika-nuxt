'use strict'

/**
* Tcash - National QR Code version
*/

const { createError } = require('libs/error')
const tcashQrn = require('libs/aqTcashQrn')

const {
  errorTypes,
  transactionFlows,
  paymentClasses,
  tokenTypes
} = require('../constants')

function checkResponse (response) {
  if (!response) {
    throw createError({
      name: errorTypes.ACQUIRER_HOST_NO_RESPONSE
    })
  }

  if (response.responseCode === '05') {
    throw createError({
      name: errorTypes.ACQUIRER_HOST_RESPONSE_ERROR
    })
  }

  if (response.responseCode === '02') {
    throw createError({
      name: errorTypes.INVALID_TRANSACTION_ON_ACQUIRER_HOST
    })
  }

  if (['01', '03'].includes(response.responseCode)) {
    throw createError({
      name: errorTypes.INVALID_ACQUIRER_CONFIG
    })
  }
}

module.exports = {
  name: tcashQrn.handlerName,
  classes: [
    paymentClasses.QRIS
  ],
  defaultMinimumAmount: 100,
  defaultMaximumAmount: null,
  singleTransactionOnly: false,
  useTraceNumber: false,
  properties: {
    flows: [
      transactionFlows.PROVIDE_TOKEN
    ],
    tokenTypes: [
      tokenTypes.TOKEN_QRCODE_CONTENT
    ],
    userTokenTypes: []
  },
  async handler (ctx) {
    const tcashQrnConfig = tcashQrn.mixConfig(ctx.acquirer.acquirerConfig.config)

    const response = await tcashQrn.generateTcashNationalQr({
      merchantTrxID: ctx.transaction.id,
      amount: ctx.transaction.amount,
      fee: 0,

      merchantName: ctx.agent.outlet.name,
      city: ctx.agent.outlet.city,
      postalCode: ctx.agent.outlet.postalCode,

      ...tcashQrnConfig
    })
    checkResponse(response)

    ctx.transaction.tokenType = tokenTypes.TOKEN_QRCODE_CONTENT
    ctx.transaction.token = response.qrString
  }
}
