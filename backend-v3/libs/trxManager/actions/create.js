'use strict'

const models = require('models')
const { createError } = require('libs/error')

const uid = require('libs/uid')
const ctxTrx = require('../ctxHelpers/ctxTrx')
const ctxCommon = require('../ctxHelpers/ctxCommon')
const { expiry } = require('./expiry')
const {
  errorTypes,
  transactionStatuses,
  transactionFlows
} = require('../constants')

const config = require('configs/trxManagerConfig')

function doAmount (ctx) {
  if (ctx.acquirer.minimumAmount) {
    if (parseFloat(ctx.transaction.amount) < parseFloat(ctx.acquirer.minimumAmount)) {
      throw createError({
        name: errorTypes.AMOUNT_TOO_LOW
      })
    }
  } else if (ctx.acquirerHandler.defaultMinimumAmount) {
    if (parseFloat(ctx.transaction.amount) < parseFloat(ctx.acquirerHandler.defaultMinimumAmount)) {
      throw createError({
        name: errorTypes.AMOUNT_TOO_LOW
      })
    }
  }

  if (ctx.acquirer.maximumAmount) {
    if (parseFloat(ctx.transaction.amount) > parseFloat(ctx.acquirer.maximumAmount)) {
      throw createError({
        name: errorTypes.AMOUNT_TOO_HIGH
      })
    }
  } else if (ctx.acquirerHandler.defaultMaximumAmount) {
    if (parseFloat(ctx.transaction.amount) > parseFloat(ctx.acquirerHandler.defaultMaximumAmount)) {
      throw createError({
        name: errorTypes.AMOUNT_TOO_HIGH
      })
    }
  }
}

function doToken (ctx) {
  ctx.userToken = ctx.transaction.userToken
  ctx.userTokenType = ctx.transaction.userTokenType

  if (
    ctx.acquirerHandler.properties.flows.includes(transactionFlows.GET_TOKEN) &&
    !ctx.acquirerHandler.properties.flows.includes(transactionFlows.PROVIDE_TOKEN) &&
    !ctx.userToken
  ) {
    throw createError({
      name: errorTypes.NEED_USER_TOKEN
    })
  }

  if (
    ctx.acquirerHandler.properties.userTokenTypes.length > 1 &&
    !ctx.userTokenType &&
    ctx.userToken
  ) {
    throw createError({
      name: errorTypes.NEED_USER_TOKEN_TYPE
    })
  }

  if (
    ctx.userTokenType &&
    !ctx.acquirerHandler.properties.userTokenTypes.includes(
      ctx.acquirerHandler.properties.userTokenTypes
    )
  ) {
    throw createError({
      name: errorTypes.INVALID_USER_TOKEN_TYPE
    })
  }
}

/**
 * Create new transaction, it will invoke
 * acquirer handler according to acquirerConfig.
 */
module.exports.create = async ({
  agentId,
  transaction,
  ctxOptions = {}
}) => {
  const ctx = ctxTrx.init({
    transaction,
    redirectName: undefined,
    redirectFromAcquirerId: undefined,
    redirectToAcquirerId: undefined,
    reversed: false,
    ...ctxOptions
  })
  await ctxCommon.doAgentLock(ctx, agentId)

  try {
    await ctxTrx.buildForNewTransaction(ctx)

    doAmount(ctx)
    doToken(ctx)

    if (typeof ctx.acquirerHandler.redirectHandler === 'function') {
      await ctx.acquirerHandler.redirectHandler(ctx)
      if (ctx.redirectToAcquirerId) {
        if (ctx.redirectFromAcquirerId) {
          throw createError({
            name: errorTypes.TOO_MANY_REDIRECT
          })
        }

        const newCtx = {}
        newCtx.redirectName = ctx.redirectName
        newCtx.redirectFromAcquirerId = transaction.acquirerId
        newCtx.local = ctx.local
        newCtx.lockDone = ctx.lockDone

        transaction.acquirerId = ctx.redirectToAcquirerId

        return exports.create({ agentId, transaction, ctxOptions: newCtx })
      } else {
        throw createError({
          name: errorTypes.REDIRECT_NO_MATCH
        })
      }
    }

    const genId = await uid.generateTransactionId()
    ctx.transaction.id = genId.id
    ctx.transaction.idAlias = genId.idAlias
    ctx.transaction.status = transactionStatuses.CREATED
    ctx.transaction.processFee = ctx.acquirer.processFee
    ctx.transaction.shareAcquirer = ctx.acquirer.shareAcquirer
    ctx.transaction.shareMerchant = ctx.acquirer.shareMerchant
    if (ctx.acquirerConfigAgent && ctx.acquirerConfigAgent.id) {
      ctx.transaction.acquirerConfigAgentId = ctx.acquirerConfigAgent.id
    }
    if (ctx.acquirerConfigOutlet && ctx.acquirerConfigOutlet.id) {
      ctx.transaction.acquirerConfigOutletId = ctx.acquirerConfigOutlet.id
    }
    if (ctx.acquirerHandler.useTraceNumber) {
      ctx.transaction.traceNumber = ctx.agent.traceNumberCounter
    }
    if (ctx.settleBatch) {
      ctx.transaction.settleBatchId = ctx.settleBatch.id
    }
    if (ctx.settleBatchIn) {
      ctx.transaction.settleBatchId = ctx.settleBatchIn.id
    }
    ctx.transaction.references = {}
    ctx.transaction.properties = {}
    ctx.transaction.encryptedProperties = {}

    ctx.transaction.userToken = undefined
    ctx.transaction.userTokenType = undefined

    ctx.transaction = models.transaction.build(ctx.transaction)
    ctx.transaction.setupEncryptedProperties(ctx.dekBuffer)

    if (ctx.transaction.agentOrderReference) {
      // await ctx.transaction.save()
    }

    ctxCommon.doHandlerTimeStart(ctx)

    await ctxCommon.doHandlerCall(ctx, 'handler')

    // Call reverse handler with new context, if status is still processing
    if (ctx.transaction.status === transactionStatuses.PROCESSING) {
      ctx.handlerFailed = true
      await ctxCommon.doHandlerCallAndIgnoreError(
        Object.assign({}, ctx),
        'reverseHandler'
      )
      if (ctx.transaction.status === transactionStatuses.REVERSED) {
        ctx.reversed = true
      }
    }

    ctxCommon.doHandlerTimeEnd(ctx)

    await ctx.transaction.save()

    // Create expiry handler, if status is created
    if (ctx.transaction.status === transactionStatuses.CREATED) {
      ctx.transactionExpirySecond = config.transactionExpirySecond
      await expiry({
        transactionId: ctx.transaction.id,
        expiryTime: ctx.transactionExpirySecond * 1000
      })
    }

    ctxCommon.doResult(ctx, {
      reversed: ctx.reversed,
      expirySecond: ctx.transactionExpirySecond || undefined,
      redirectFromAcquirerId: ctx.redirectFromAcquirerId || undefined,
      redirectName: ctx.redirectName || undefined,

      transactionId: ctx.transaction.id,
      agentId: ctx.transaction.agentId,
      acquirerId: ctx.transaction.acquirerId,
      amount: ctx.transaction.amount,
      transactionStatus: ctx.transaction.status,
      token: ctx.transaction.token || undefined,
      tokenType: ctx.transaction.tokenType || undefined,
      createdAt: ctx.transaction.createdAt
    })
  } catch (err) {
    await ctx.lockDone()
    throw err
  }
  await ctx.lockDone()
  return ctx.result
}
