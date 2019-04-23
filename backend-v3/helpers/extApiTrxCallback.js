'use strict'

/**
 * This module get transaction event and make webhook call (if any)
 * for Public API
 */

const extApiCallback = require('./extApiCallback')
const redis = require('./redis')

const msgFactory = require('./msgFactory')
const extApiObjectFactory = require('./extApiObjectFactory')
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

module.exports.addTransactionCallback = async (idKey, url, transactionId) => {
  await removeActiveTrx(transactionId)
  await redis.setex(
    trxRedisKey(transactionId),
    Math.floor(
      (appConfig.transactionTimeoutSecond * 1.5) +
      (extApiConfig.callBackDelaySecond * (extApiConfig.callBackRetryCount * 2))
    ),
    JSON.stringify({
      idKey,
      url
    })
  )
}

trxManager.listenStatusChange(async (event) => {
  let activeTrx = await getActiveTrx(event.transactionId)
  if (activeTrx) {
    let transactionObject = await extApiObjectFactory.mapTransactionObject(event.transactionData)

    let eventType = null
    if (transactionObject.transactionStatus === trxManager.transactionStatuses.SUCCESS) {
      eventType = msgFactory.eventTypes.EVENT_TRANSACTION_SUCCESS
    } else if (transactionObject.transactionStatus === trxManager.transactionStatus.FAILED) {
      eventType = msgFactory.eventTypes.EVENT_TRANSACTION_FAILED
    }

    let callbackPayload = msgFactory.createNotificationMessage(
      eventType,
      transactionObject
    )

    await extApiCallback.createCallback(
      activeTrx.idKey,
      activeTrx.url,
      callbackPayload,
      () => removeActiveTrx(event.transactionId)
    )
  }
})
