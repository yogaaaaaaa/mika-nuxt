'use strict'

/**
 * Default Mqtt Config
 */

const uid = require('../libs/uid')

const appConfig = require('./appConfig')

const configName = 'mqttConfig'

let baseConfig = {
  url: process.env.MIKA_MQTT_URL || 'mqtt://localhost',
  superuserName: process.env.MIKA_MQTT_SUPERUSER_NAME || 'superuser',
  superuserPassword: process.env.MIKA_MQTT_SUPERUSER_PASSWORD || '',
  authPattern: process.env.MIKA_MQTT_AUTH_PATTERN || `${appConfig.name}:mosq:%u`,
  authACLPattern: process.env.MIKA_MQTT_AUTH_ACL_PATTERN || `${appConfig.name}:mosqacl:%u:%t`,
  redisUrls: process.env.MIKA_MQTT_REDIS_URLS || appConfig.redisUrls,
  authExpirySecond: 7 * 24 * 60,
  clientId: process.env.MIKA_MQTT_CLIENT_ID || null,
  cleanSession: false,
  keepalive: 60,
  qosDefault: 1,
  passwordHashIter: 100,
  waitConnectTimeoutSecond: 30
}

if (!baseConfig.clientId) {
  let clientIdFile = 'mqttClientId'
  let clientId = appConfig.readCacheFile(clientIdFile)

  if (clientId) {
    baseConfig.clientId = clientId
  } else {
    baseConfig.clientId = `${appConfig.name}-${baseConfig.superuserName}-${uid.randomString()}`
    appConfig.writeCacheFile(clientIdFile, baseConfig.clientId)
  }
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
