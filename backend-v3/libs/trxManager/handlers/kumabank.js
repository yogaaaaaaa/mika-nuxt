'use strict'

/**
* Kuma Bank Acquirer Handler - a card payment provider for development environment
*/

const _ = require('lodash')
const { createError } = require('libs/error')
const timer = require('libs/timer')
const card = require('libs/card')

const {
  errorTypes,
  transactionStatuses,
  transactionFlows,
  paymentClasses,
  userTokenTypes
} = require('../constants')

module.exports = {
  name: 'kumabank',
  classes: [
    paymentClasses.CARD_CREDIT,
    paymentClasses.CARD_DEBIT
  ],
  defaultMinimumAmount: 25000,
  defaultMaximumAmount: null,
  singleTransactionOnly: false,
  useTraceNumber: true,
  properties: {
    flows: [
      transactionFlows.GET_TOKEN
    ],
    tokenTypes: [],
    userTokenTypes: [
      userTokenTypes.USER_TOKEN_CARD
    ]
  },
  async handler (ctx) {
    const userToken = ctx.userToken

    userToken.emv = userToken.emv || userToken.emvData
    userToken.track2 = userToken.track2 || userToken.track2Data
    userToken.pinBlock = userToken.pinBlock || userToken.pinblockData

    if (!_.isPlainObject(userToken)) {
      throw createError({
        name: errorTypes.INVALID_USER_TOKEN
      })
    }
    if (!userToken.emv && !userToken.track2) {
      throw createError({
        name: errorTypes.INVALID_USER_TOKEN
      })
    }
    if (
      !userToken.signature &&
      !userToken.pin &&
      !userToken.pinBlock &&
      !userToken.standardPinBlock &&
      !userToken.doubleLengthPinBlock
    ) {
      throw createError({
        name: errorTypes.INVALID_USER_TOKEN
      })
    }

    let emvTags
    let track2
    if (userToken.emv) {
      emvTags = card.tlvDecode(userToken.emv)
      track2 = card.tlvTagFind(emvTags, card.emvTags.TRACK_2_EQUIVALENT_DATA)
    } else {
      track2 = userToken.track2
    }

    const track2Component = card.track2GetComponent(track2)

    ctx.transaction.status = transactionStatuses.SUCCESS
    ctx.transaction.reference = String(Math.floor(1 + Math.random() * Number.MAX_SAFE_INTEGER))
    ctx.transaction.referenceName = 'rrn'
    ctx.transaction.customerReference = track2Component.truncatedPan
    ctx.transaction.customerReferenceName = 'truncatedPan'
    ctx.transaction.authorizationReference = String(Math.floor(1 + Math.random() * Number.MAX_SAFE_INTEGER))
    ctx.transaction.authorizationReferenceName = 'approvalCode'

    ctx.transaction.properties.iin = track2Component.first6
    if (ctx.local.cardIin) {
      ctx.transaction.properties.cardIin = {
        name: ctx.local.cardIin.name,
        scheme: ctx.local.cardIin.cardSchemeId,
        issuer: ctx.local.cardIin.cardIssuerId,
        type: ctx.local.cardIin.cardTypeId
      }
    }

    ctx.transaction.encryptedProperties.track2Component = {
      pan: track2Component.pan,
      expirationDate: track2Component.expirationDate,
      serviceCode: track2Component.serviceCode
    }
    ctx.transaction.changed('encryptedProperties', 'true')

    // Random delay
    await timer.delay(100 + Math.random() * 5000)

    // Random failure
    if (Math.random() < 0.01) {
      throw createError({
        name: errorTypes.ACQUIRER_HOST_NO_RESPONSE
      })
    }
  }
}
