'use strict'

/**
 * Notification config
 */

const commonConfig = require('./commonConfig')
const isEnvProduction = process.env.NODE_ENV === 'production'

let baseConfig = {
  brokerUrl: isEnvProduction ? 'wss://broker.mikaapp.id' : 'wss://stg31broker.mikaapp.id',
  topicClientPrefix: `${commonConfig.name}/notif-client`,
  topicServerPrefix: `${commonConfig.name}/notif-server`,
  topicBroadcastPrefix: `${commonConfig.name}/notif-broadcast`,

  agentPrefix: isEnvProduction ? `agent` : `${commonConfig.name}-agent`
}

/**
 * Load external config file
 */
try {
  const configName = require('path').basename(__filename, '.js')
  let extraConfig = require(`./${process.env.MIKA_CONFIG_GROUP ? `_configs.${process.env.MIKA_CONFIG_GROUP}` : '_configs'}/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`${configName} is mixed`)
} catch (err) {}

module.exports = baseConfig
