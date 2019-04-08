'use strict'

/**
 * Config sample/template
 */

const configName = 'sampleConfig'

let baseConfig = {
  // Put your config here
}

/**
 * Load external config file
 */
try {
  let extraConfig = require(`./_configs/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`Config ${configName} is mixed`)
} catch (error) {}

// Place any sanity check here

module.exports = baseConfig
