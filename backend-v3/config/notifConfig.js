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
 * Load external config file '${configName}_extra.js' as extraConfig, in same directory
 * And create a mixin between baseConfig and extraConfig
 */
try {
  let extraBaseConfig = require(`./${configName}_extra`)
  baseConfig = Object.assign({}, baseConfig, extraBaseConfig)
  console.log(`config ${configName} is mixed`)
} catch (error) { }

module.exports = baseConfig
