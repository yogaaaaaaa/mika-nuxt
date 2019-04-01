'use strict'

/**
 * Handles MQTT based push notification
 */

const transactionManager = require('./transactionManager')
const apiMsgFactory = require('./apiMsgFactory')

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

transactionManager.addListener(transactionManager.transactionEvent.SUCCESS_WITH_DATA, async (eventObject) => {
  await exports.notifToAgent(
    eventObject.transactionData.terminal.id,
    apiMsgFactory.createNotificationMessage(apiMsgFactory.eventTypes.EVENT_TRANSACTION_SUCCESS, eventObject.transactionData, true, false)
  )
})

transactionManager.addListener(transactionManager.transactionEvent.FAILED_WITH_DATA, async (eventObject) => {
  await exports.notifToAgent(
    eventObject.transactionData.terminal.id,
    apiMsgFactory.createNotificationMessage(apiMsgFactory.eventTypes.EVENT_TRANSACTION_FAILED, eventObject.transactionData, true, false)
  )
})