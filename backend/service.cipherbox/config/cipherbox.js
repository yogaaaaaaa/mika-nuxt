'use strict'

const configName = 'redisConfig'

/**
 * Default cipherbox module config
 */
let config = {
  timestampTolerance: process.env['CIPHERBOX_TIMESTAMP_TOLERANCE'] || 15, // in seconds
  sessionTimeout: process.env['CIPHERBOX_SESSION_TIMEOUT'] || 15 // in seconds
}

/**
 * Load external config file '${configName}_extra.js' as extraConfig, in same directory
 * And create a mixin between baseConfig and extraConfig
 */
try {
  let extraConfig = require(`./${configName}_extra`)
  config = Object.assign({}, config, extraConfig)
  console.log(`config ${configName} is mixed`)
} catch (error) { }

module.exports = config
