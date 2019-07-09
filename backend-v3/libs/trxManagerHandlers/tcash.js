'use strict'

const tcash = require('../aqTcash')

/**
 * Tcash/LinkAja Acquirer handler
 */

module.exports = (trxManager) => {
  trxManager.acquirerHandlers.push({
    name: tcash.handlerName,
    classes: tcash.handlerClasses,
    defaultMinimumAmount: 100,
    defaultMaximumAmount: null,
    properties: {
      flows: [
        trxManager.transactionFlows.PROVIDE_TOKEN
      ],
      tokenTypes: [
        trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      ],
      userTokenTypes: []
    },
    async handler (ctx) {
      ctx.transaction.tokenType = trxManager.tokenTypes.TOKEN_QRCODE_CONTENT
      ctx.transaction.token = tcash.createQrCode({
        acc_no: ctx.transaction.idAlias,
        ...tcash.mixConfig(ctx.acquirer.acquirerConfig.config)
      })
    }
  })
}
