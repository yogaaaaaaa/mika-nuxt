'use strict'

/**
 * This module get transaction event and make webhook call (if any)
 * for Public API
 */

const extApiCallback = require('./extApiCallback')
const redis = require('./redis')

const models = require('../models')

const msg = require('./msg')
const extApiObject = require('./extApiObject')
const trxManager = require('./trxManager')

const extApiConfig = require('../configs/extApiConfig')
const commonConfig = require('../configs/commonConfig')

function trxRedisKey (transactionId) {
  return `extApiTrxCb:${transactionId}`
}

async function getActiveTrx (transactionId) {
  return JSON.parse(await redis.get(trxRedisKey(transactionId)))
}

async function removeActiveTrx (transactionId) {
  return redis.del(trxRedisKey(transactionId))
}

module.exports.addCallback = async (idKey, url, transactionId) => {
  await removeActiveTrx(transactionId)
  await redis.set(
    trxRedisKey(transactionId),
    JSON.stringify({
      idKey,
      url
    }),
    'EX',
    Math.floor(
      ((commonConfig.transactionTimeoutSecond * 1000) * 1.5) +
      (extApiConfig.callBackDelay * (extApiConfig.callBackRetryCount * 2))
    )
  )
}

trxManager.listenStatusChange(async (event) => {
  const activeTrx = await getActiveTrx(event.transactionId)
  if (activeTrx) {
    const transaction = models.transaction.scope('partner').findByPk(event.transactionId)

    const mappedTransaction = extApiObject.mapTransaction(transaction)

    let eventType = null
    if (event.transactionStatus === trxManager.transactionStatuses.SUCCESS) {
      eventType = msg.eventTypes.EVENT_TRANSACTION_SUCCESS
    } else if (event.transactionStatus === trxManager.transactionStatus.FAILED) {
      eventType = msg.eventTypes.EVENT_TRANSACTION_FAILED
    }

    const callbackPayload = msg.createNotification(
      eventType,
      mappedTransaction
    )

    await removeActiveTrx(event.transactionId)

    await extApiCallback.createCallback(
      activeTrx.idKey,
      activeTrx.url,
      callbackPayload
    )
  }
})
