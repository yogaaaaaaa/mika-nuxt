'use strict'

/**
 * Fairpay middleware payment provider handler
 */

const fp = require('../ppFairpay')

let fpConfig = null

module.exports = (trxManager) => {
  trxManager.ppHandlers.push({
    name: 'fp',
    aliases: ['emvDebit', 'emvCredit'],
    properties: [
      trxManager.transactionFlows.GATEWAY,
      trxManager.transactionFlows.GET_TOKEN,
      trxManager.userTokenTypes.USER_TOKEN_EMV_MIKA
    ],
    preHandler: async (config) => {
      fpConfig = {}

      if (!config.userToken) {
        return trxManager.errorCodes.NEED_USER_TOKEN
      }
      fpConfig.amount = config.amount
      fpConfig = fp.mixConfig(Object.assign(fpConfig, config.userToken))

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
            reference_number: fpConfig.saleResponse.invoice_num,
            transaction_status_id: trxManager.transactionStatuses.SUCCESS.id,
            card_approval_code: fpConfig.saleResponse.approval_code
          }
          if (typeof fpConfig.cardPan === 'string') {
            if (fpConfig.cardPan.length >= 10) {
              // TODO : using regex here is probably good idea
              config.transaction.card_pan = `${fpConfig.cardPan.substring(0, 6)}${'*'.repeat(fpConfig.cardPan.length - (6 + 4))}${fpConfig.cardPan.slice(-4)}`
            }
          }
          if (typeof fpConfig.cardPrinciple === 'string') {
            config.transaction.card_principle = fpConfig.cardPrinciple
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
