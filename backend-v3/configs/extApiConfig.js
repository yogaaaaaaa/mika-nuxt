'use strict'

/**
 * Default config for ext Api Auth
 */

let baseConfig = {
  tokenTimeout: 30000, // in milliseconds

  idKeyLength: 6, // in bytes
  idKeyEncoding: 'hex',

  secretKeyLength: 12, // in bytes
  secretKeyEncoding: 'base64',

  sharedKeyLength: 12, // in bytes
  sharedKeyEncoding: 'base64',

  callBackRetryCount: 10,
  callBackDelay: 5000
}

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
