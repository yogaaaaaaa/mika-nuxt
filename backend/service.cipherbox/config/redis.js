'use strict'

const configName = 'redisConfig'

const baseConfig = require('./base')

/**
 * Default cipherbox config
 */
let config = {
  redisURL: process.env['REDIS_URL'] || 'redis://localhost',
  redisPrefix: process.env['REDIS_PREFIX'] || `${baseConfig.name}-${baseConfig.namespace}`
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
