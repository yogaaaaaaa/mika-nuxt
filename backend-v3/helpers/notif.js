'use strict'

/**
 * Handles MQTT based push notification
 */

const crypto = require('crypto')

const trxManager = require('./trxManager')
const msgFactory = require('./msgFactory')
const mqtt = require('./mqtt')

const config = require('../configs/notifConfig')

module.exports.agentBrokerDetail = (agentId, genPassword = false) => {
  const user = `${config.userPrefix}${agentId}`
  const password = genPassword ? crypto.randomBytes(18).toString('base64') : null
  const clientId = user
  const cleanSession = false
  const brokerUrl = config.brokerUrl
  const clientTopic = `${config.topicClientPrefix}/${user}`
  const serverTopic = `${config.topicServerPrefix}/${user}`
  const broadcastTopic = `${config.topicBroadcastPrefix}`

  return {
    brokerUrl,
    user,
    password,
    clientId,
    cleanSession,
    clientTopic,
    serverTopic,
    broadcastTopic
  }
}

module.exports.addAgent = async (agentId, expirySecond = null) => {
  const agentBrokerDetail = exports.agentBrokerDetail(agentId, true)
  await mqtt.addAuthUser(agentBrokerDetail.user, agentBrokerDetail.password, expirySecond)
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
  ], expirySecond)

  return agentBrokerDetail
}

module.exports.refreshAgent = async (agentId, expirySecond) => {
  if (expirySecond) {
    const agentBrokerDetail = exports.agentBrokerDetail(agentId)
    await mqtt.refreshAuthUser(agentBrokerDetail.user, expirySecond)
    await mqtt.refreshAuthTopics(agentBrokerDetail.user, [
      agentBrokerDetail.clientTopic,
      agentBrokerDetail.serverTopic,
      agentBrokerDetail.broadcastTopic
    ], expirySecond)
  }
}

module.exports.removeAgent = async (agentId) => {
  const agentBrokerDetail = exports.agentBrokerDetail(agentId)
  await mqtt.removeAuthUser(agentBrokerDetail.user)
  await mqtt.removeAuthTopic(agentBrokerDetail.user, agentBrokerDetail.clientTopic)
  await mqtt.removeAuthTopic(agentBrokerDetail.user, agentBrokerDetail.serverTopic)
  await mqtt.removeAuthTopic(agentBrokerDetail.user, agentBrokerDetail.broadcastTopic)
}

module.exports.notifToAgent = async (agentId, message) => {
  try {
    await mqtt.publish(`${config.topicClientPrefix}/${config.userPrefix}${agentId}`, message)
  } catch (err) {
    console.log(err)
  }
}

trxManager.addListener(trxManager.transactionEvents.SUCCESS, async (eventObject) => {
  await exports.notifToAgent(
    eventObject.transaction.agentId,
    msgFactory.createNotification(
      msgFactory.eventTypes.EVENT_TRANSACTION_SUCCESS,
      { transactionId: eventObject.transactionId },
      true
    )
  )
})

trxManager.addListener(trxManager.transactionEvents.FAILED, async (eventObject) => {
  msgFactory.createNotification(
    msgFactory.eventTypes.EVENT_TRANSACTION_FAILED,
    { transactionId: eventObject.transactionId },
    true
  )
})
