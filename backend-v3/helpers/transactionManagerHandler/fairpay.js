'use strict'

const fairpayPG = require('../pgFairpay')

let fpConfig = null

module.exports = (transactionManager) => {
  transactionManager.pgHandlers.push({
    name: 'fairpay',
    alias: ['emvDebit', 'emvCredit'],
    properties: 'gatewayCapable,emvDebit,emvCredit,takeUserToken,userTokenEmvTags_57_82_95_9A_9C_5F2A_5F34_9F02_9F03_9F10_9F1A_9F26_9F27_9F33_9F34_9F35_9F36_9F37',
    tokenParameter: {
      pgType: null,
      tokenType: null,
      userTokenType: transactionManager.userTokenType.USER_TOKEN_EMV_MIKA
    },
    preHandler: async (config) => {
      fpConfig = {}

      if (!config.userToken) {
        return transactionManager.errorCode.NEED_USER_TOKEN
      }
      fpConfig.amount = config.amount
      fpConfig = fairpayPG.mixConfig(Object.assign(fpConfig, config.userToken))

      if (!fpConfig.token) {
        if (!(await fairpayPG.getToken(fpConfig))) {
          await fairpayPG.apiLogin(fpConfig)
          await fairpayPG.setToken(fpConfig)
        }
      }

      if (!fairpayPG.createSaleRequest(fpConfig)) {
        return true
      }

      let apiNumTry = 2

      while (apiNumTry) {
        let resCode = fairpayPG.getFairpayResponseCode(await fairpayPG.apiDebitCreditSale(fpConfig))
        if (
          resCode === fairpayPG.fairpayResponseCode.AUTH_NOT_LOGIN ||
          resCode === fairpayPG.fairpayResponseCode.AUTH_VALIDATION_FAILED ||
          resCode === fairpayPG.fairpayResponseCode.AUTH_BAD_TOKEN
        ) {
          if (fairpayPG.getFairpayResponseCode(await fairpayPG.apiLogin(fpConfig)) === fairpayPG.fairpayResponseCode.LOGIN_SUCCESS) {
            await fairpayPG.setToken(fpConfig)
          }
        } else if (resCode === fairpayPG.fairpayResponseCode.SALE_APPROVED) {
          config.transactionData = {
            reference_number: fpConfig.saleResponse.invoice_num,
            transaction_status_id: transactionManager.transactionStatus.SUCCESS.id,
            card_approval_code: fpConfig.saleResponse.approval_code
          }
          if (typeof fpConfig.cardPan === 'string') {
            if (fpConfig.cardPan.length >= 10) {
              // TODO : using regex here is probably good idea
              config.transactionData.card_pan = `${fpConfig.cardPan.substring(0, 6)}${'*'.repeat(fpConfig.cardPan.length - (6 + 4))}${fpConfig.cardPan.slice(-4)}`
            }
          }
          if (typeof fpConfig.cardPrinciple === 'string') {
            config.transactionData.card_principle = fpConfig.cardPrinciple
          }
          // TODO : rollback need to decided when saving signature fail
          await fairpayPG.apiSaveSignature(fpConfig)
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
