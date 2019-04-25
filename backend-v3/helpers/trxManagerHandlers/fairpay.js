'use strict'

/**
 * Fairpay middleware payment provider handler
 */

const fairpay = require('../ppFairpay')

module.exports = (trxManager) => {
  trxManager.ppHandlers.push({
    name: 'fairpay',
    classes: ['emvDebit', 'emvCredit'],
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
      if (!ctx.transaction.userToken) throw trxManager.error(trxManager.errorTypes.NEED_USER_TOKEN)

      let fpCtx = fairpay.mixConfig(Object.assign(
        {
          amount: ctx.transaction.amount
        },
        ctx.transaction.userToken,
        ctx.paymentProvider.paymentProviderConfig.config
      ))

      ctx.transaction.userToken = undefined

      if (!await fairpay.getToken(fpCtx)) await fairpay.apiLogin(fpCtx)

      fairpay.createSaleRequest(fpCtx)

      if (fpCtx.cardTypesOnly) {
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
        throw trxManager.error(trxManager.errorTypes.PAYMENT_PROVIDER_NOT_RESPONDING)
      }
    }
  })
}
