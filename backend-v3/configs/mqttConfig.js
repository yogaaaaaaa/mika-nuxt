'use strict'

/**
 * Default Mqtt Config
 * Including auth generation for mosquitto_auth_plugin
 */

const uid = require('../libs/uid')

const commonConfig = require('./commonConfig')
const redisConfig = require('./redisConfig')

const isEnvProduction = process.env.NODE_ENV === 'production'

let baseConfig = {
  url: 'mqtt://localhost',
  superuserName: 'superuser',
  superuserPassword: 'superuser',
  authPattern: isEnvProduction ? `mika-v3:mosq:%u` : `mika-v3-dev:mosq:%u`,
  authACLPattern: isEnvProduction ? `mika-v3:mosqacl:%u:%t` : `mika-v3-dev:mosqacl:%u:%t`,
  redisUrls: redisConfig.urls,
  authExpirySecond: 7 * 24 * 60,
  clientId: null,
  cleanSession: true,
  keepalive: 60,
  qosDefault: 1,
  passwordHashIter: 100,
  waitConnectTimeoutSecond: 30
}

baseConfig.clientId = `${commonConfig.name}-${baseConfig.superuserName}-${uid.randomString()}`

/**
 * Load external config file
 */
try {
  const configName = require('path').basename(__filename, '.js')
  let extraConfig = require(`./${process.env.MIKA_CONFIG_GROUP ? `_configs.${process.env.MIKA_CONFIG_GROUP}` : '_configs'}/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`${configName} is mixed`)
} catch (error) {}

module.exports = baseConfig
