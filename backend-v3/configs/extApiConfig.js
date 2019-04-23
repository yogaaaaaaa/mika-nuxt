'use strict'

const configName = 'extApiConfig'

/**
 * Default config for ext Api Auth
 */
let baseConfig = {
  tokenTimeout: 30000, // in milliseconds

  idKeyLength: 6, // in bytes
  idKeyEncoding: 'hex',

  secretKeyLength: 12, // in bytes
  secretKeyEncoding: 'base64',

  sharedKeyLength: '12', // in bytes
  sharedKeyEncoding: 'base64',

  callBackRetryCount: 10,
  callBackDelaySecond: 5000
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
