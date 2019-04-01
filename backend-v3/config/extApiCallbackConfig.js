'use strict'

const configName = 'extApiCallbackConfig'

/**
 * Default API Callback Config
 */
let baseConfig = {
  callBackRetryCount: 10,
  callBackDelay: 5000
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
