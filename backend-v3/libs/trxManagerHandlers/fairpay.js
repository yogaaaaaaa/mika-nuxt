'use strict'

/**
 * Fairpay middleware acquirer handler
 */

const _ = require('lodash')

const fairpay = require('../aqFairpay')

module.exports = (trxManager) => {
  trxManager.acquirerHandlers.push({
    name: fairpay.handlerName,
    classes: fairpay.handlerClasses,
    defaultMinimumAmount: null,
    defaultMaximumAmount: null,
    properties: {
      flows: [
        trxManager.transactionFlows.GET_TOKEN,
        trxManager.transactionFlows.GATEWAY
      ],
      tokenTypes: [],
      userTokenTypes: [
        trxManager.userTokenTypes.USER_TOKEN_EMV_MIKA
      ]
    },
    handler: async (ctx) => {
      if (!_.isPlainObject(ctx.transaction.userToken)) throw trxManager.error(trxManager.errorTypes.INVALID_USER_TOKEN)

      let fpCtx = fairpay.mixConfig(Object.assign(
        {
          amount: ctx.transaction.amount
        },
        ctx.transaction.userToken,
        ctx.acquirer.acquirerConfig.config
      ))

      ctx.transaction.userToken = undefined

      if (!fairpay.createSaleRequest(fpCtx)) throw trxManager.error(trxManager.errorTypes.INVALID_USER_TOKEN)

      if (!await fairpay.getToken(fpCtx)) await fairpay.apiLogin(fpCtx)

      if (Array.isArray(fpCtx.cardTypesOnly)) {
        await fairpay.processAuthAndApi(fairpay.apiDebitCreditCheck, fpCtx)
        if (!fpCtx.cardTypesOnly.includes(fpCtx.cardType)) {
          throw trxManager.error(trxManager.errorTypes.INVALID_USER_TOKEN)
        }
      }

      await fairpay.processAuthAndApi(fairpay.apiDebitCreditSale, fpCtx)
      if (fpCtx.saleResponse) {
        ctx.transaction.status = trxManager.transactionStatuses.SUCCESS

        ctx.transaction.referenceNumber = fpCtx.saleResponse.invoice_num
        ctx.transaction.referenceNumberName = 'invoice_num'

        ctx.transaction.cardApprovalCode = fpCtx.saleResponse.approval_code
        ctx.transaction.cardPan = fpCtx.cardPanMasked
        ctx.transaction.cardNetwork = fpCtx.cardNetwork

        // TODO: rollback need to decided when saving signature fail
        await fairpay.apiSaveSignature(fpCtx)
      } else {
        throw trxManager.error(trxManager.errorTypes.ACQUIRER_HOST_UNAVAILABLE)
      }
    }
  })
}
