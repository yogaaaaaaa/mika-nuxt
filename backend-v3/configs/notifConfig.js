'use strict'

/**
 * Notification config
 */

const commonConfig = require('configs/commonConfig')
const isEnvProduction = process.env.NODE_ENV === 'production'

let baseConfig = {
  brokerUrl: isEnvProduction ? 'wss://broker.mikaapp.id' : 'wss://stg31broker.mikaapp.id',
  brokerUrlAlt: isEnvProduction ? 'mqtts://broker.mikaapp.id' : 'mqtts://stg31broker.mikaapp.id:8893',
  topicClientPrefix: `${commonConfig.name}/notif-client`,
  topicServerPrefix: `${commonConfig.name}/notif-server`,
  topicBroadcastPrefix: `${commonConfig.name}/notif-broadcast`,

  agentPrefix: isEnvProduction ? 'agent' : `${commonConfig.name}-agent`
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

module.exports = baseConfig
