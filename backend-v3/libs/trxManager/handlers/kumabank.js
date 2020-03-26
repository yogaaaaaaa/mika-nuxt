'use strict'

/**
* Kuma Bank Acquirer Handler - a card payment provider for development environment
*/

const _ = require('lodash')
const { createError } = require('libs/error')
const timer = require('libs/timer')
const card = require('libs/card')
const kumabank = require('libs/aqKumabank')

function getResponseMessage (responseCode) {
  if (!(responseCode in kumabank.responseCodes)) responseCode = '00'
  const handlerResponse = {
    responseCode,
    responseMessage: kumabank.responseCodes[responseCode]
  }
  return handlerResponse
}

const {
  errorTypes,
  transactionStatuses,
  transactionFlows,
  paymentClasses,
  userTokenTypes,
  settleBatchStatuses
} = require('../constants')

module.exports = {
  name: 'kumabank',
  classes: [
    paymentClasses.CARD_CREDIT,
    paymentClasses.CARD_DEBIT
  ],
  defaultMinimumAmount: 1,
  defaultMaximumAmount: null,
  singleTransactionOnly: true,
  useTraceNumber: true,
  settleByAcquirerConfigAgent: true,
  properties: {
    flows: [
      transactionFlows.GET_TOKEN,
      transactionFlows.VOID,
      transactionFlows.REVERSE_SUCCESS,
      transactionFlows.REVERSE_VOID
    ],
    tokenTypes: [],
    userTokenTypes: [
      userTokenTypes.USER_TOKEN_CARD
    ]
  },
  async handler (ctx) {
    // const debug = require('debug')('mika:trxManager:kumabank:handler')

    ctx.transaction.status = transactionStatuses.PROCESSING

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

    if (
      userToken.pin ||
      userToken.pinBlock ||
      userToken.standardPinBlock ||
      userToken.doubleLengthPinBlock
    ) {
      userToken.signature = undefined
    }

    let emvTags
    let track2
    if (userToken.emv) {
      emvTags = card.tlvDecode(userToken.emv)
      track2 = card.tlvValueFind(emvTags, card.emvTags.TRACK_2_EQUIVALENT_DATA)
    } else {
      track2 = userToken.track2
    }

    let entryMode
    if (userToken.emv) {
      if (userToken.signature) {
        entryMode = card.posEntryMode.CHIP_WITHOUT_PIN
      } else {
        entryMode = card.posEntryMode.CHIP_WITH_PIN
      }
    } else if (userToken.track2) {
      if (userToken.signature) {
        entryMode = card.posEntryMode.MAGSTRIPE_WITHOUT_PIN
      } else {
        entryMode = card.posEntryMode.MAGSTRIPE_WITH_PIN
      }
    }

    const track2Component = card.track2GetComponent(track2)
    ctx.transaction.properties.iin = track2Component.first6

    if (ctx.local.cardIin) {
      ctx.transaction.properties.cardIin = {
        name: ctx.local.cardIin.name,
        scheme: ctx.local.cardIin.cardSchemeId,
        issuer: ctx.local.cardIin.cardIssuerId,
        type: ctx.local.cardIin.cardTypeId
      }
    }
    ctx.transaction.properties.posCode = '00'
    ctx.transaction.properties.entryMode = entryMode
    ctx.transaction.properties.signature = userToken.signature

    ctx.debug = {
      createDelay: 0,
      createNoResponse: false,
      createResponseCode: '00',
      ...ctx.debug
    }

    if (ctx.debug.createDelay) {
      await timer.delay(ctx.debug.createDelay)
    } else {
      await timer.delay(100 + Math.random() * 2000)
    }

    if (ctx.debug.createNoResponse) {
      ctx.handlerResponse = undefined
      return
    }

    if (ctx.debug.createPinError) {
      ctx.handlerResponse = getResponseMessage('55')
    } else {
      ctx.handlerResponse = getResponseMessage(ctx.debug.createResponseCode)
    }

    if (ctx.handlerResponse.responseCode === '00') {
      ctx.transaction.status = transactionStatuses.SUCCESS

      ctx.transaction.reference = String(Math.floor(1 + Math.random() * 999999999998)).padStart(12, '0')
      ctx.transaction.referenceName = 'rrn'

      ctx.transaction.customerReference = track2Component.truncatedPan
      ctx.transaction.customerReferenceName = 'truncatedPan'

      ctx.transaction.authorizationReference = String(Math.floor(1 + Math.random() * 999998)).padStart(6, '0')
      ctx.transaction.authorizationReferenceName = 'approvalCode'

      ctx.transaction.acquirerTimeAt = (new Date()).toISOString()
    } else {
      ctx.handlerFailed = true
      ctx.transaction.status = transactionStatuses.FAILED
    }
  },
  async voidHandler (ctx) {
    // const debug = require('debug')('mika:trxManager:kumabank:voidHandler')

    ctx.transaction.status = transactionStatuses.VOIDING

    ctx.debug = {
      voidDelay: 0,
      voidNoResponse: false,
      voidResponseCode: '00',
      ...ctx.debug
    }

    if (ctx.debug.voidDelay) {
      await timer.delay(ctx.debug.voidDelay)
    } else {
      await timer.delay(100 + Math.random() * 2000)
    }

    if (ctx.debug.voidNoResponse) {
      ctx.handlerResponse = undefined
      return
    }

    ctx.handlerResponse = getResponseMessage(ctx.debug.voidResponseCode)

    if (ctx.handlerResponse.responseCode === '00') {
      ctx.transaction.status = transactionStatuses.VOIDED

      ctx.transaction.voidReference = String(Math.floor(1 + Math.random() * 999999999998)).padStart(12, '0')
      ctx.transaction.voidReferenceName = 'rrn'

      ctx.transaction.voidAuthorizationReference = String(Math.floor(1 + Math.random() * 999998)).padStart(6, '0')
      ctx.transaction.voidAuthorizationReferenceName = 'approvalCode'

      ctx.transaction.voidAcquirerTimeAt = (new Date()).toISOString()
    }
  },
  async reverseHandler (ctx) {
    // const debug = require('debug')('mika:trxManager:kumabank:reverseHandler')

    ctx.debug = {
      reverseDelay: 0,
      reverseNoResponse: false,
      reverseResponseCode: '00',
      ...ctx.debug
    }

    if (ctx.debug.reverseDelay) {
      await timer.delay(ctx.debug.reverseDelay)
    } else {
      await timer.delay(100 + Math.random() * 2000)
    }

    if (ctx.debug.reverseNoResponse) {
      ctx.handlerResponse = undefined
      return
    }

    ctx.handlerResponse = getResponseMessage(ctx.debug.reverseResponseCode)

    if (ctx.handlerResponse.responseCode === '00') {
      ctx.transaction.status = transactionStatuses.REVERSED
    }
  },
  async reverseVoidHandler (ctx) {
    ctx.debug = {
      reverseVoidDelay: 0,
      reverseVoidNoResponse: false,
      reverseVoidResponseCode: '00',
      ...ctx.debug
    }

    if (ctx.debug.reverseVoidDelay) {
      await timer.delay(ctx.debug.reverseVoidDelay)
    } else {
      await timer.delay(100 + Math.random() * 2000)
    }

    if (ctx.debug.reverseVoidNoResponse) {
      ctx.handlerResponse = undefined
      return
    }

    ctx.handlerResponse = getResponseMessage(ctx.debug.reverseVoidResponseCode)

    if (ctx.handlerResponse.responseCode === '00') {
      ctx.transaction.status = transactionStatuses.SUCCESS
    }
  },
  async agentSettleHandler (ctx) {
    // const debug = require('debug')('mika:trxManager:kumabank:agentSettleHandler')

    ctx.debug = {
      agentSettleDelay: 0,
      agentSettleNoResponse: false,
      agentSettleResponseCode: '00',
      ...ctx.debug
    }

    if (ctx.debug.agentSettleDelay) {
      await timer.delay(ctx.debug.agentSettleDelay)
    } else {
      await timer.delay(100 + Math.random() * 2000)
    }

    if (ctx.debug.agentSettleNoResponse) {
      ctx.handlerResponse = undefined
      return
    }

    ctx.handlerResponse = getResponseMessage(ctx.debug.agentSettleResponseCode)

    if (ctx.handlerResponse.responseCode === '00') {
      ctx.settleBatch.status = settleBatchStatuses.CLOSED
      ctx.settleBatch.acquirerTimeAt = (new Date()).toISOString()
    }
  }
}
