'use strict'

/**
 * Handles MQTT based push notification
 */

const trxManager = require('./trxManager')
const msgFactory = require('./msgFactory')

const mqtt = require('./mqtt')

const config = require('../config/notifConfig')
module.exports.config = config

module.exports.agentJoin = async (agentId) => {
  let user = `${config.userPrefix}${agentId}`
  let brokerDetail = {
    brokerUrl: config.brokerUrl,
    user,
    password: await mqtt.addAuthUser(user),
    clientTopic: `${config.topicClientPrefix}/${user}`,
    serverTopic: `${config.topicServerPrefix}/${user}`,
    broadcastTopic: `${config.topicBroadcastPrefix}`
  }

  await mqtt.addAuthTopic(brokerDetail.user, brokerDetail.clientTopic, mqtt.aclKey.READ_ONLY)
  await mqtt.addAuthTopic(brokerDetail.user, brokerDetail.serverTopic, mqtt.aclKey.READ_WRITE)
  await mqtt.addAuthTopic(brokerDetail.user, brokerDetail.broadcastTopic, mqtt.aclKey.READ_WRITE)

  return brokerDetail
}

module.exports.notifToAgent = async (agentId, message) => {
  try {
    await mqtt.publish(`${config.topicClientPrefix}/${config.userPrefix}${agentId}`, message)
  } catch (err) {}
}

trxManager.addListener(trxManager.transactionEvents.SUCCESS_WITH_DATA, async (eventObject) => {
  await exports.notifToAgent(
    eventObject.transaction.agentId,
    msgFactory.createNotificationMessage(msgFactory.eventTypes.EVENT_TRANSACTION_SUCCESS, eventObject.transactionData, true, false)
  )
})

trxManager.addListener(trxManager.transactionEvents.FAILED_WITH_DATA, async (eventObject) => {
  await exports.notifToAgent(
    eventObject.transaction.agentId,
    msgFactory.createNotificationMessage(msgFactory.eventTypes.EVENT_TRANSACTION_FAILED, eventObject.transactionData, true, false)
  )
})
