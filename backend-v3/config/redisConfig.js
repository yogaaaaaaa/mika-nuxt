'use strict'

const configName = 'redisConfig'

/**
 * Default Redis Config
 */
let baseConfig = {
  url: process.env.MIKA_REDIS_URL || 'redis://localhost',
  password: process.env.MIKA_REDIS_PASSWORD || null
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
