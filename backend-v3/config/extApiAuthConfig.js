'use strict'

const appConfig = require('./appConfig')

const configName = 'extApiAuthConfig'

/**
 * Default config for Auth
 */
let baseConfig = {
  defaultKeyName: 'fooKey',
  defaultEmail: 'foo@partners.example.com',

  keyIdLength: 6, // in bytes
  keyIdEncoding: 'hex',

  keySecretLength: 12, // in bytes
  keySecretEncoding: 'base64',

  keySharedLength: '12', // in bytes
  keySharedEncoding: 'base64',

  bcryptSaltRound: 10,

  redisKeyPrefix: process.env.MIKA_API_AUTH_REDIS_KEY_PREFIX || `${appConfig.name}-apiAuth`,

  tokenTimeout: process.env.MIKA_API_AUTH_TIMEOUT || 30000 // in milliseconds
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
