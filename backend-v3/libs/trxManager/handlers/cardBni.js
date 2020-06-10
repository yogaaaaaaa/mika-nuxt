'use strict'

/**
* Bank BNI Acquirer Host via FTIE
*/
const _ = require('lodash')

const { createError } = require('libs/error')
const bni = require('libs/aqBni')

const ctxSettle = require('../ctxHelpers/ctxSettle')

const {
  errorTypes,
  transactionStatuses,
  settleBatchStatuses,
  transactionFlows,
  paymentClasses,
  userTokenTypes
} = require('../constants')

function getResponseMessage (response) {
  const handlerResponse = {
    responseCode: response.ResponseCode,
    responseMessage: bni.responseCodes[response.ResponseCode]
  }
  if (
    response.ResponseCode === 'LE' &&
    response.PrivateData63
  ) {
    const leError = Buffer.from(response.PrivateData63, 'hex')
      .slice(1)
      .toString('ascii')
    handlerResponse.responseMessage = (`${handlerResponse.responseMessage} - ${leError}`).trim()
  }
  return handlerResponse
}

function assignCommonConfig (ctx, config) {
  config = bni.mixConfig(ctx.acquirerConfigMerged, config)

  if (!ctx.acquirerConfigAgent && !ctx.acquirerConfigAgent.acquirerTerminal) {
    throw createError({
      name: errorTypes.INVALID_ACQUIRER_CONFIG
    })
  }
  config.mid = ctx.acquirerConfigAgent.acquirerTerminal.mid
  config.tid = ctx.acquirerConfigAgent.acquirerTerminal.tid
  config.sessionUserDekBuffer = ctx.sessionUserDekBuffer

  return config
}

function assignUserTokenConfig (ctx, config) {
  config = config || {}

  if (ctx.transaction.encryptedProperties.cardData) { // restore from storage
    const cardData = ctx.transaction.encryptedProperties.cardData
    config.pan = cardData.pan
    config.appPan = cardData.appPan
    config.expirationDate = cardData.expirationDate
  } else { // online process
    const userToken = ctx.userToken

    if (!_.isPlainObject(userToken)) {
      throw createError({
        name: errorTypes.INVALID_USER_TOKEN
      })
    }

    if (userToken.emv) {
      config.emv = userToken.emv
    } else if (userToken.track2) {
      config.track2 = userToken.track2
    } else {
      throw createError({
        name: errorTypes.INVALID_USER_TOKEN
      })
    }

    if (userToken.pin) {
      config.pin = userToken.pin
    } else if (userToken.pinBlock) {
      config.pinBlock = userToken.pinBlock
    } else if (userToken.standardPinBlock) {
      config.standardPinBlock = userToken.standardPinBlock
    } else if (userToken.doubleLengthPinBlock) {
      config.doubleLengthPinBlock = userToken.doubleLengthPinBlock
    } else if (userToken.signature) {
      config.signature = userToken.signature
    } else {
      throw createError({
        name: errorTypes.INVALID_USER_TOKEN
      })
    }
  }

  return config
}

function assignSaleConfig (ctx, config) {
  config = config || {}

  config.amount = ctx.transaction.amount
  config.traceNumber = ctx.transaction.traceNumber
  config.ecr = ctx.transaction.traceNumber

  return config
}

function assignExistingSaleConfig (ctx, config) {
  config = config || {}

  config.transactionDateTime = ctx.transaction.acquirerTimeAt
  config.amount = ctx.transaction.amount
  config.traceNumber = ctx.agent.traceNumberCounter

  config.reference = ctx.transaction.reference
  config.authorizationReference = ctx.transaction.authorizationReference
  config.posCode = ctx.transaction.properties.posCode
  config.entryMode = ctx.transaction.properties.entryMode

  config.ecr = ctx.transaction.references.ecr

  return config
}

function assignReverseVoidSaleConfig (ctx, config) {
  config = config || {}

  config.transactionDateTime = ctx.transaction.voidAcquirerTimeAt
  config.amount = ctx.transaction.amount
  config.traceNumber = ctx.transaction.voidTraceNumber

  config.reference = ctx.transaction.voidReference
  config.authorizationReference = ctx.transaction.voidAuthorizationReference
  config.posCode = ctx.transaction.properties.posCode
  config.entryMode = ctx.transaction.properties.entryMode

  config.ecr = ctx.transaction.references.ecr

  return config
}

function assignReverseSaleConfig (ctx, config) {
  config = config || {}

  config.traceNumber = ctx.transaction.traceNumber

  return config
}

function assignSettlementConfig (ctx, config) {
  config = config || {}

  config.traceNumber = ctx.settleBatch.traceNumber
  config.batchNumber = ctx.settleBatch.batchNumber
  config.amountSettle = ctx.settleBatch.amountSettle
  config.countSettle = ctx.settleBatch.transactionSettleCount

  return config
}

function assignBatchUploadConfig (ctx, config) {
  config = config || {}

  config.responseCode = '00'

  return config
}

function assignSaleTransaction (config, ctx, response) {
  ctx.transaction.reference = response.ReferenceNumber
  ctx.transaction.referenceName = 'rrn'
  ctx.transaction.customerReference = config.track2Component.truncatedPan
  ctx.transaction.customerReferenceName = 'truncatedPan'
  ctx.transaction.authorizationReference = response.ApprovalCode
  ctx.transaction.authorizationReferenceName = 'approvalCode'
  ctx.transaction.acquirerTimeAt = response.TransactionDateTime

  ctx.transaction.properties.cardIin = {
    iin: config.track2Component.first6
  }
  if (ctx.local.cardIin) {
    ctx.transaction.properties.cardIin = {
      ...ctx.transaction.properties.cardIin,
      name: ctx.local.cardIin.name,
      scheme: ctx.local.cardIin.cardSchemeId,
      issuer: ctx.local.cardIin.cardIssuerId,
      type: ctx.local.cardIin.cardTypeId
    }
  }

  ctx.transaction.references.ecr = config.ecr
  ctx.transaction.changed('references', true)

  ctx.transaction.properties.createHandlerResponse = ctx.handlerResponse
  ctx.transaction.properties.emv = config.commonEmvTags
  ctx.transaction.properties.hostEmvResponse = response.EmvData
  ctx.transaction.properties.emvResponse = response.EmvData
  ctx.transaction.properties.posCode = config.posCode
  ctx.transaction.properties.entryMode = config.entryMode
  ctx.transaction.properties.signature = config.signature
  ctx.transaction.changed('properties', true)

  ctx.transaction.encryptedProperties.cardData = {
    appPan: config.appPan,
    pan: config.pan,
    expirationDate: config.expirationDate
  }
  ctx.transaction.changed('encryptedProperties', true)
}

function assignVoidSaleTransaction (config, ctx, response) {
  ctx.transaction.voidTraceNumber = config.traceNumber

  ctx.transaction.voidReference = response.ReferenceNumber
  ctx.transaction.voidReferenceName = 'rrn'
  ctx.transaction.voidAuthorizationReference = response.ApprovalCode
  ctx.transaction.voidAuthorizationReferenceName = 'approvalCode'
  ctx.transaction.voidAcquirerTimeAt = response.TransactionDateTime

  ctx.transaction.properties.voidHandlerResponse = ctx.handlerResponse
  ctx.transaction.changed('properties', true)
}

const handlerCommon = {
  defaultMinimumAmount: 1,
  defaultMaximumAmount: 9999999999,
  singleTransactionOnly: true,
  useTraceNumber: true,
  useDek: true,
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
    ctx.transaction.status = transactionStatuses.PROCESSING

    const config = assignCommonConfig(ctx)
    assignUserTokenConfig(ctx, config)
    assignSaleConfig(ctx, config)

    if (this.name === bni.handlerNameCredit && config.terminalKeyCredit) {
      config.pinKey = config.terminalKeyCredit.pinKey
    } else if (this.name === bni.handlerNameDebit && config.terminalKey) {
      config.pinKey = config.terminalKey.pinKey
    }

    if (!config.pinKey || !config.tid || !config.mid) {
      throw createError({
        name: errorTypes.INVALID_ACQUIRER_CONFIG
      })
    }

    const response = await bni.sale(config)
    if (response) {
      if (response.ResponseCode === '00') {
        ctx.transaction.status = transactionStatuses.SUCCESS
      } else {
        ctx.handlerFailed = true
        ctx.transaction.status = transactionStatuses.FAILED
      }
      ctx.handlerResponse = getResponseMessage(response)
    }

    assignSaleTransaction(config, ctx, response || {})
  },
  async voidHandler (ctx) {
    ctx.transaction.status = transactionStatuses.VOIDING

    const config = assignCommonConfig(ctx)
    assignUserTokenConfig(ctx, config)
    assignExistingSaleConfig(ctx, config)

    config.transactionDateTime = undefined

    const response = await bni.saleVoid(config)
    if (response) {
      if (response.ResponseCode === '00') {
        ctx.transaction.status = transactionStatuses.VOIDED
      } else {
        ctx.handlerFailed = true
        ctx.transaction.status = transactionStatuses.SUCCESS
      }
      ctx.handlerResponse = getResponseMessage(response)
    }

    assignVoidSaleTransaction(config, ctx, response || {})
  },
  async reverseHandler (ctx) {
    const config = assignCommonConfig(ctx)
    assignUserTokenConfig(ctx, config)
    assignExistingSaleConfig(ctx, config)
    assignReverseSaleConfig(ctx, config)

    if (this.name === bni.handlerNameDebit) {
      config.transactionDateTime = undefined
    }

    const response = await bni.saleReverse(config)
    if (response) {
      if (response.ResponseCode === '00') {
        ctx.transaction.status = transactionStatuses.REVERSED
      }
      ctx.handlerResponse = getResponseMessage(response)
    }

    ctx.transaction.properties.reverseHandlerResponse = ctx.handlerResponse
    ctx.transaction.changed('properties', true)
  },
  async reverseVoidHandler (ctx) {
    const config = assignCommonConfig(ctx)
    assignUserTokenConfig(ctx, config)
    assignReverseVoidSaleConfig(ctx, config)

    if (this.name === bni.handlerNameDebit) {
      config.transactionDateTime = undefined
    }

    const response = await bni.saleVoidReverse(config)
    if (response) {
      if (response.ResponseCode === '00') {
        ctx.transaction.status = transactionStatuses.SUCCESS
      }
      ctx.handlerResponse = getResponseMessage(response)
    }

    ctx.transaction.properties.voidReverseHandlerResponse = ctx.handlerResponse
    ctx.transaction.changed('properties', true)
  },
  async agentSettleHandler (ctx) {
    const debug = require('debug')('mika:trxManager:cardBni:agentSettleHandler')

    const baseConfig = assignCommonConfig(ctx)
    const settleConfig = { ...baseConfig }
    assignSettlementConfig(ctx, settleConfig)

    const initialResponse = await bni.initialSettlement(settleConfig)
    if (initialResponse) {
      ctx.handlerResponse = getResponseMessage(initialResponse)

      if (initialResponse.ResponseCode === '00') {
        debug(`settle batch ${ctx.settleBatch.id} balanced`)

        ctx.settleBatch.status = settleBatchStatuses.CLOSED
        ctx.settleBatch.acquirerTimeAt = initialResponse.TransactionDateTime
      } else if (initialResponse.ResponseCode === '95') {
        debug(`settle batch ${ctx.settleBatch.id} not balanced, begin batch upload`)

        while (await ctxSettle.doGetNextTransactions(ctx)) {
          for (const transaction of ctx.transactions) {
            debug(`settle batch ${ctx.settleBatch.id}, batch upload ${transaction.id}`)

            ctx.transaction = transaction
            ctx.agent.incrementTraceCounter()

            const batchUploadConfig = { ...baseConfig }
            assignUserTokenConfig(ctx, batchUploadConfig)
            assignExistingSaleConfig(ctx, batchUploadConfig)
            assignBatchUploadConfig(ctx, batchUploadConfig)

            if (this.name === bni.handlerNameDebit) {
              batchUploadConfig.transactionDateTime = undefined
            }

            const batchUploadResponse = await bni.batchUpload(batchUploadConfig)
            if (!(
              batchUploadResponse &&
              batchUploadResponse.ResponseCode === '00'
            )) {
              ctx.handlerResponse = getResponseMessage(batchUploadResponse)
              return
            }
          }
        }

        ctx.agent.incrementTraceCounter()
        ctx.settleBatch.traceNumber = ctx.agent.traceNumberCounter
        assignSettlementConfig(ctx, settleConfig)

        const finalResponse = await bni.finalSettlement(settleConfig)
        if (
          finalResponse &&
          finalResponse.ResponseCode === '00'
        ) {
          debug(`settle batch ${ctx.settleBatch.id} closed`)
          ctx.handlerResponse = getResponseMessage(finalResponse)

          ctx.settleBatch.status = settleBatchStatuses.CLOSED
          ctx.settleBatch.acquirerTimeAt = finalResponse.TransactionDateTime
        }
      }
    }
  }
}

module.exports = [
  {
    ...handlerCommon,
    name: bni.handlerNameDebit,
    classes: [
      paymentClasses.CARD_DEBIT
    ]
  },
  {
    ...handlerCommon,
    name: bni.handlerNameCredit,
    classes: [
      paymentClasses.CARD_CREDIT
    ]
  }
]
