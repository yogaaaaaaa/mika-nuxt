'use strict'

/**
 * Handles MQTT based push notification
 */

const crypto = require('crypto')

const trxManager = require('libs/trxManager')
const msg = require('libs/msg')
const mqtt = require('libs/mqtt')
const models = require('models')

const commonConfig = require('configs/commonConfig')
const config = require('configs/notifConfig')

const authExpirySecond = commonConfig.authExpirySecond

module.exports.brokerHost = {
  brokerUrl: config.brokerUrl,
  brokerUrlAlt: config.brokerUrlAlt
}

module.exports.agentBrokerDetail = (agentId, genPassword = false) => {
  const user = `${config.agentPrefix}${agentId}`
  const password = genPassword ? crypto.randomBytes(18).toString('base64') : null
  const clientId = user
  const cleanSession = false
  const clientTopic = `${config.topicClientPrefix}/${user}`
  const serverTopic = `${config.topicServerPrefix}/${user}`
  const broadcastTopic = `${config.topicBroadcastPrefix}`

  return {
    user,
    password,
    clientId,
    cleanSession,
    clientTopic,
    serverTopic,
    broadcastTopic
  }
}

module.exports.addAgent = async (agentId) => {
  const agentBrokerDetail = exports.agentBrokerDetail(agentId, true)
  await mqtt.addAuthUser(agentBrokerDetail.user, agentBrokerDetail.password, authExpirySecond)
  await mqtt.addAuthTopics(agentBrokerDetail.user, [
    {
      topic: agentBrokerDetail.clientTopic,
      rw: mqtt.aclKeyTypes.READ_ONLY
    },
    {
      topic: agentBrokerDetail.serverTopic,
      rw: mqtt.aclKeyTypes.READ_WRITE
    },
    {
      topic: agentBrokerDetail.broadcastTopic,
      rw: mqtt.aclKeyTypes.READ_WRITE
    }
  ], authExpirySecond)

  return agentBrokerDetail
}

module.exports.refreshAgent = async (agentId) => {
  const agentBrokerDetail = exports.agentBrokerDetail(agentId)
  await mqtt.refreshAuthUser(agentBrokerDetail.user, authExpirySecond)
  await mqtt.refreshAuthTopics(agentBrokerDetail.user, [
    agentBrokerDetail.clientTopic,
    agentBrokerDetail.serverTopic,
    agentBrokerDetail.broadcastTopic
  ], authExpirySecond)
}

module.exports.removeAgent = async (agentId) => {
  const agentBrokerDetail = exports.agentBrokerDetail(agentId)
  await mqtt.removeAuthUser(agentBrokerDetail.user)
  await mqtt.removeAuthTopics(agentBrokerDetail.user, [
    agentBrokerDetail.clientTopic,
    agentBrokerDetail.serverTopic,
    agentBrokerDetail.broadcastTopic
  ])
}

module.exports.notifToAgent = async (agentId, message) => {
  try {
    const topic = `${config.topicClientPrefix}/${config.agentPrefix}${agentId}`
    await mqtt.publish(topic, message)
  } catch (err) {
    console.error(err)
  }
}

module.exports.agentExist = async (agentId) => {
  return mqtt.getAuthUser(`${config.agentPrefix}${agentId}`)
}

trxManager.listenTransactionEvent(async (eventCtx) => {
  if (await exports.agentExist(eventCtx.agentId)) {
    let eventType

    /** Deprecated, will use simpler payload */
    if (eventCtx.transactionStatus === trxManager.transactionStatuses.SUCCESS) {
      eventType = msg.eventTypes.EVENT_TRANSACTION_SUCCESS
    } else if (eventCtx.transactionStatus === trxManager.transactionStatuses.FAILED) {
      eventType = msg.eventTypes.EVENT_TRANSACTION_FAILED
    } else if (eventCtx.transactionStatus === trxManager.transactionStatuses.EXPIRED) {
      eventType = msg.eventTypes.EVENT_TRANSACTION_EXPIRED
    }

    if (eventType) {
      const findOptions = {}
      if (eventCtx.t) findOptions.transaction = eventCtx.t

      const transaction = await models.transaction
        .scope('agent')
        .findByPk(eventCtx.transactionId, findOptions)

      await exports.notifToAgent(
        eventCtx.agentId,
        msg.createNotification(eventType, transaction)
      )
    }
  }
})

trxManager.listenAgentSettleBatchEvent(async (eventCtx) => {
  if (await exports.agentExist(eventCtx.agentId)) {
    const data = {
      settleBatchId: eventCtx.settleBatchId,
      settleBatchStatus: eventCtx.settleBatchStatus
    }

    await exports.notifToAgent(
      eventCtx.agentId,
      msg.createNotification(msg.eventTypes.EVENT_SETTLE_BATCH, data)
    )
  }
})
