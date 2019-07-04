'use strict'

/**
 * Config sample/template
 */

let baseConfig = {
  // Put your config here
}

// Put runtime generated config here

/**
 * Load external config file
 */
try {
  const configName = require('path').basename(__filename, '.js')
  let extraConfig = require(`./${process.env.MIKA_CONFIG_GROUP ? `_configs.${process.env.MIKA_CONFIG_GROUP}` : '_configs'}/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`${configName} is mixed`)
} catch (err) {}

// Put after mix runtime generated config here
// Place any sanity check here

module.exports = baseConfig
