'use strict'

/**
 * Default API Callback Config
 */

const configName = 'extApiCallbackConfig'

let baseConfig = {
  callBackRetryCount: 10,
  callBackDelay: 5000
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
