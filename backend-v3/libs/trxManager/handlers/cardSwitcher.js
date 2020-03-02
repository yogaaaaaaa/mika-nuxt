'use strict'

const _ = require('lodash')
const { createError } = require('libs/error')
const card = require('libs/card')
const models = require('models')

const {
  errorTypes,
  transactionFlows,
  paymentClasses,
  userTokenTypes
} = require('../constants')

module.exports = {
  name: 'cardSwitcher',
  classes: [
    paymentClasses.CARD_SWITCHER,
    paymentClasses.CARD_CREDIT,
    paymentClasses.CARD_DEBIT
  ],
  defaultMinimumAmount: null,
  defaultMaximumAmount: null,
  singleTransactionOnly: false,
  useTraceNumber: false,
  properties: {
    flows: [
      transactionFlows.GET_TOKEN
    ],
    tokenTypes: [],
    userTokenTypes: [
      userTokenTypes.USER_TOKEN_CARD
    ]
  },
  async redirectHandler (ctx) {
    const config = ctx.acquirer.acquirerConfig.config
    const userToken = ctx.userToken

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

    if (Array.isArray(config.rules)) {
      if (userToken.emv) {
        const emvTags = card.tlvDecode(userToken.emv)
        ctx.local.track2 = card.tlvValueFind(emvTags, card.emvTags.TRACK_2_EQUIVALENT_DATA)
      } else {
        ctx.local.track2 = userToken.track2
      }
      if (!ctx.local.track2) {
        throw createError({
          name: errorTypes.INVALID_USER_TOKEN
        })
      }
      ctx.local.track2Component = card.track2GetComponent(ctx.local.track2)
      if (!ctx.local.track2Component.expirationDateValid) {
        throw createError({
          name: errorTypes.INVALID_USER_TOKEN
        })
      }

      ctx.local.cardIins = await (models.cardIin.scope([
        'info',
        { method: ['findPattern', ctx.local.track2Component.pan] }
      ])).findAll({
        limit: 10
      })

      if (ctx.local.cardIins.length === 0) return

      for (const cardIin of ctx.local.cardIins) {
        for (const rule of config.rules) {
          let match
          if (_.isPlainObject(rule)) {
            if (Array.isArray(rule.cardIinIds)) {
              if (match === undefined) match = true
              match = match && rule.cardIinIds.includes(cardIin.id)
              if (!match) continue
            }
            if (Array.isArray(rule.cardIssuerIds)) {
              if (match === undefined) match = true
              match = match && rule.cardIssuerIds.includes(cardIin.cardIssuerId)
              if (!match) continue
            }
            if (Array.isArray(rule.cardTypeIds)) {
              if (match === undefined) match = true
              match = match && rule.cardTypeIds.includes(cardIin.cardTypeId)
              if (!match) continue
            }
          }
          if (match) {
            ctx.redirectName = rule.name
            ctx.redirectToAcquirerId = rule.acquirerId
            ctx.local.cardIin = cardIin
            return
          }
        }
      }
    }
  }
}
