'use strict'

const configName = 'baseConfig'

/**
 * Default base config
 */
let config = {
  namespace: process.env['SERVICE_NAMESPACE'] || (process.env.NODE_ENV === 'development' ? 'mikadev' : 'mika'),
  name: process.env['SERVICE_NAME'] || 'repl'
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
