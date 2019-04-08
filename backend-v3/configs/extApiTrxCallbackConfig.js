'use strict'

/**
 * Default API Transaction Callback Config
 */

const appConfig = require('./appConfig')

const configName = 'extApiTrxCallbackConfig'

let baseConfig = {
  redisPrefix: process.env.MIKA_EXT_API_TRANSACTION_CALLBACK_REDIS_KEY_PREFIX || `${appConfig.name}-extApiTrxCallback`
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
