'use strict'

const appConfig = require('./appConfig')

const configName = 'extApiTrxCallbackConfig'

/**
 * Default API Transaction Callback Config
 */
let baseConfig = {
  redisKeyPrefix: process.env.MIKA_API_TRANSACTION_CALLBACK_REDIS_KEY_PREFIX || `${appConfig.name}-apiTrxCallback`
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
