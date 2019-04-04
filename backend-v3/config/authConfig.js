'use strict'

const configName = 'authConfig'

const appConfig = require('./appConfig')

/**
 * Default Internal API auth Config
 * config for internal API authentication
 */
let baseConfig = {
  redisPrefix: `${appConfig.name}-auth`,
  authExpiry: 21600 || process.env.MIKA_API_AUTH_EXPIRY, // in seconds
  bcryptSaltRound: 10,
  secretKey: 'mika_secret_key' || process.env.MIKA_API_AUTH_SECRET_KEY // in seconds
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
