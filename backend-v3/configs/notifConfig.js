'use strict'

const appConfig = require('./appConfig')

const configName = 'notifConfig'

let baseConfig = {
  brokerUrl: process.env.MIKA_MQTT_NOTIF_URL || (process.env.NODE_ENV === 'development' ? 'wss://stg12broker.mikaapp.id' : 'wss://broker.mikaapp.id'),
  topicClientPrefix: process.env.MIKA_MQTT_NOTIF_CLIENT_TOPIC_PREFIX || `${appConfig.name}/notif-client`,
  topicServerPrefix: process.env.MIKA_MQTT_NOTIF_SERVER_TOPIC_PREFIX || `${appConfig.name}/notif-server`,
  topicBroadcastPrefix: process.env.MIKA_MQTT_NOTIF_BROADCAST_TOPIC_PREFIX || `${appConfig.name}/notif-broadcast`,
  userPrefix: 'user'
}

/**
 * Load external config file
 */
try {
  let extraConfig = require(`./_configs/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`Config ${configName} is mixed`)
} catch (error) { }

module.exports = baseConfig
