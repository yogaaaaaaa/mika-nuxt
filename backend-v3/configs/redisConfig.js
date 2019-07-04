'use strict'

/**
 * Default Redis Config
 */

const commonConfig = require('./commonConfig')

let baseConfig = {
  urls: 'redis://localhost',
  prefix: null
}

/**
 * Load external config file
 */
try {
  const configName = require('path').basename(__filename, '.js')
  let extraConfig = require(`./${process.env.MIKA_CONFIG_GROUP ? `_configs.${process.env.MIKA_CONFIG_GROUP}` : '_configs'}/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`${configName} is mixed`)
} catch (err) {}

let urls = baseConfig.urls.split(',')
if (urls.length > 1) baseConfig.urls = urls

if (!baseConfig.prefix) {
  baseConfig.prefix = `${commonConfig.name}:`
}

module.exports = baseConfig
