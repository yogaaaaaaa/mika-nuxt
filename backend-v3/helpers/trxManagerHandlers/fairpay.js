'use strict'

/**
 * Fairpay middleware payment provider handler
 */

const fp = require('../ppFairpay')

let fpConfig = null

module.exports = (trxManager) => {
  trxManager.ppHandlers.push({
    name: 'fp',
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
    preHandler: async (config) => {
      if (!config.userToken) {
        return trxManager.errorCodes.NEED_USER_TOKEN
      }

      fpConfig = fp.mixConfig(
        { amount: config.amount },
        config.userToken,
        config.paymentProvider.paymentProviderConfig.config
      )

      if (!fpConfig.token) {
        if (!(await fp.getToken(fpConfig))) {
          await fp.apiLogin(fpConfig)
          await fp.setToken(fpConfig)
        }
      }

      if (!fp.createSaleRequest(fpConfig)) {
        return true
      }

      let apiNumTry = 2

      while (apiNumTry) {
        let resCode = fp.getFairpayResponseCode(await fp.apiDebitCreditSale(fpConfig))
        if (
          resCode === fp.fpResponseCode.AUTH_NOT_LOGIN ||
          resCode === fp.fpResponseCode.AUTH_VALIDATION_FAILED ||
          resCode === fp.fpResponseCode.AUTH_BAD_TOKEN
        ) {
          if (fp.getFairpayResponseCode(await fp.apiLogin(fpConfig)) === fp.fpResponseCode.LOGIN_SUCCESS) {
            await fp.setToken(fpConfig)
          }
        } else if (resCode === fp.fpResponseCode.SALE_APPROVED) {
          config.transaction = {
            transactionStatus: trxManager.transactionStatuses.SUCCESS,
            referenceNumber: fpConfig.saleResponse.invoice_num,
            referenceNumberType: 'invoice_num',
            cardApprovalCode: fpConfig.saleResponse.approval_code
          }
          if (typeof fpConfig.cardPan === 'string') {
            if (fpConfig.cardPan.length >= 10) {
              // TODO : using regex here is probably good idea
              config.transaction.cardPan = `${fpConfig.cardPan.substring(0, 6)}${'*'.repeat(fpConfig.cardPan.length - (6 + 4))}${fpConfig.cardPan.slice(-4)}`
            }
          }
          if (typeof fpConfig.cardPrinciple === 'string') {
            config.transaction.cardNetwork = fpConfig.cardPrinciple
          }
          // TODO : rollback need to decided when saving signature fail
          await fp.apiSaveSignature(fpConfig)
          return
        } else {
          return true
        }
        apiNumTry--
      }
      return true
    }
  })
}
