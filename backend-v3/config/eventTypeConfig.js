'use strict'

const configName = 'eventTypeConfig'

/**
 * Default Event Type Config
 */
let baseConfig = {
  EVENT_GENERIC: 'generic',
  EVENT_TRANSACTION_SUCCESS: 'transactionSuccess',
  EVENT_TRANSACTION_FAILED: 'transactionFailed'
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
