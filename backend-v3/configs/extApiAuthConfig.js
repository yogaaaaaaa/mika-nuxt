'use strict'

const appConfig = require('./app')

const configName = 'extApiAuthConfig'

/**
 * Default config for ext Api Auth
 */
let baseConfig = {
  redisPrefix: `${appConfig.name}-extApiAuth`,
  tokenTimeout: 30000, // in milliseconds

  defaultKeyName: 'fooKey',
  defaultEmail: 'foo@partners.example.com',

  keyIdLength: 6, // in bytes
  keyIdEncoding: 'hex',

  keySecretLength: 12, // in bytes
  keySecretEncoding: 'base64',

  keySharedLength: '12', // in bytes
  keySharedEncoding: 'base64'
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
