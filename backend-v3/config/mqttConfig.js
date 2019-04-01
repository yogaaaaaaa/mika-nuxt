'use strict'

const appConfig = require('./appConfig')

const configName = 'mqttConfig'

/**
 * Default Mqtt Config
 */
let baseConfig = {
  url: process.env.MIKA_MQTT_URL || 'mqtt://localhost',
  superuserName: process.env.MIKA_MQTT_SUPERUSER_NAME || 'superuser',
  superuserPassword: process.env.MIKA_MQTT_SUPERUSER_PASSWORD || '',
  authPattern: process.env.MIKA_MQTT_AUTH_PATTERN || `${appConfig.name}-mosq:%u`,
  authACLPattern: process.env.MIKA_MQTT_AUTH_ACL_PATTERN || `${appConfig.name}-mosqacl:%u:%t`,
  keyExpiry: 7 * 24 * 60 * 1000,
  cleanSession: false,
  keepalive: 60,
  qosDefault: 1,
  passwordHashIter: 100
}

baseConfig.clientId = process.env.MIKA_MQTT_CLIENT_ID || `${appConfig.name}-${baseConfig.superuserName}`

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
