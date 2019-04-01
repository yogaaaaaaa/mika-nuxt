'use strict'

/**
 * This module get transaction event and make webhook call (if any)
 * for Public API
 */

const apiCallback = require('./extApiCallback')
const redis = require('./redis')

const msgFactory = require('./msgFactory')
const extApiObjectFactory = require('./extApiObjectFactory')
const transactionManager = require('./transactionManager')

const config = require('../config/extApiTrxCallbackConfig')

async function getActiveTransaction (transactionId) {
  return JSON.parse(await redis.get(`${config.redisKeyPrefix}:${transactionId}`))
}

async function removeActiveTransaction (transactionId) {
  return redis.del(`${config.redisKeyPrefix}:${transactionId}`)
}

module.exports.addTransactionCallback = async (keyId, url, transactionId) => {
  await removeActiveTransaction(transactionId)
  await redis.set(
    `${config.redisKeyPrefix}:${transactionId}`,
    JSON.stringify({ keyId, url }),
    Math.floor(
      (transactionManager.config.transactionTimeout * 1.5) +
      (apiCallback.config.callBackDelay * apiCallback.config.callBackRetryCount)
    )
  )
}

async function eventListener (eventObject) {
  let apiDetail = await getActiveTransaction(eventObject.transactionId)
  if (apiDetail) {
    console.log('receive transaction event for api callback')

    let transactionObject = await extApiObjectFactory.mapTransactionObject(eventObject.transactionData)

    let eventType = null
    if (transactionObject.transactionStatus === transactionManager.transactionStatus.SUCCESS.status) {
      eventType = msgFactory.eventTypes.EVENT_TRANSACTION_SUCCESS
    } else if (transactionObject.transactionStatus === transactionManager.transactionStatus.FAILED.status) {
      eventType = msgFactory.eventTypes.EVENT_TRANSACTION_FAILED
    }

    let notifPayload = msgFactory.createNotificationMessage(
      eventType,
      transactionObject
    )

    await apiCallback.makeApiCallback(
      apiDetail.keyId,
      apiDetail.url,
      notifPayload,
      () => removeActiveTransaction(eventObject.transactionId)
    )
  }
}

transactionManager.addListener(transactionManager.transactionEvent.SUCCESS_WITH_DATA, eventListener)
transactionManager.addListener(transactionManager.transactionEvent.FAILED_WITH_DATA, eventListener)
