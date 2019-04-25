'use strict'

/**
 * This module get transaction event and make webhook call (if any)
 * for Public API
 */

const extApiCallback = require('./extApiCallback')
const redis = require('./redis')

const models = require('../models')

const msgFactory = require('./msgFactory')
const extApiObject = require('./extApiObject')
const trxManager = require('./trxManager')

const extApiConfig = require('../configs/extApiConfig')
const appConfig = require('../configs/appConfig')

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
      ((appConfig.transactionTimeoutSecond * 1000) * 1.5) +
      (extApiConfig.callBackDelay * (extApiConfig.callBackRetryCount * 2))
    )
  )
}

trxManager.listenStatusChange(async (event) => {
  let activeTrx = await getActiveTrx(event.transactionId)
  if (activeTrx) {
    let transaction = models.transaction.scope('partner').findByPk(event.transactionId)

    let mappedTransaction = extApiObject.mapTransaction(transaction)

    let eventType = null
    if (event.transactionStatus === trxManager.transactionStatuses.SUCCESS) {
      eventType = msgFactory.eventTypes.EVENT_TRANSACTION_SUCCESS
    } else if (event.transactionStatus === trxManager.transactionStatus.FAILED) {
      eventType = msgFactory.eventTypes.EVENT_TRANSACTION_FAILED
    }

    let callbackPayload = msgFactory.createNotification(
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
