'use strict'

/**
* Kuma Bank Acquirer Handler - a card payment provider for development environment
*/

const _ = require('lodash')

const timer = require('../timer')
const emv = require('../emv')

module.exports = (trxManager) => {
  trxManager.acquirerHandlers.push({
    name: 'kumabank',
    classes: ['emvDebit', 'emvCredit'],
    defaultMinimumAmount: 25000,
    defaultMaximumAmount: null,
    properties: {
      flows: [
        trxManager.transactionFlows.GET_TOKEN
      ],
      tokenTypes: [],
      userTokenTypes: [
        trxManager.userTokenTypes.USER_TOKEN_EMV_MIKA
      ]
    },
    async handler (ctx) {
      const userToken = ctx.transaction.userToken
      ctx.transaction.userToken = undefined
      if (!_.isPlainObject(userToken)) {
        throw trxManager.error(trxManager.errorTypes.INVALID_USER_TOKEN)
      }
      if (!userToken.emvData && !userToken.track2Data) {
        throw trxManager.error(trxManager.errorTypes.INVALID_USER_TOKEN)
      }

      let emvTags
      let track2Data
      if (userToken.emvData) {
        emvTags = emv.tlvDecode(userToken.emvData)
        track2Data = emv.tlvTagFind(emv.emvTags.TRACK_2_EQUIVALENT_DATA, emvTags)
      } else {
        track2Data = userToken.track2Data
      }
      track2Data = emv.track2RemoveSymbol(track2Data)

      const cardPan = emv.track2GetPAN(track2Data)
      const panComponent = cardPan.match(/(\d{6})(.*)(\d{4})/)
      const cardPanMasked = `${panComponent[1]}${'*'.repeat(panComponent[2].length)}${panComponent[3]}`
      const cardBin = panComponent[1]
      let cardNetwork
      if (cardBin[0] === '4') cardNetwork = 'visa'
      if (cardBin[0] === '5') cardNetwork = 'mastercard'

      ctx.transaction.status = trxManager.transactionStatuses.SUCCESS
      ctx.transaction.referenceNumber = String(Math.floor(1 + Math.random() * Number.MAX_SAFE_INTEGER))
      ctx.transaction.referenceNumberName = 'invoice_num'
      ctx.transaction.cardApprovalCode = String(Math.floor(1 + Math.random() * Number.MAX_SAFE_INTEGER))
      ctx.transaction.cardPan = cardPanMasked
      ctx.transaction.cardNetwork = cardNetwork

      // Random delay
      await timer.delay(100 + Math.random() * 5000)

      // Random failure
      if (Math.random() < 0.01) throw trxManager.error(trxManager.errorTypes.ACQUIRER_HOST_UNAVAILABLE)
    }
  })
}
