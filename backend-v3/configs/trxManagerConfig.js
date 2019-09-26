'use strict'

/**
 * Transaction manager config
 */

let baseConfig = {
  transactionExpirySecond: 3 * 60
}

/**
 * Load external config file
 */
try {
  const configName = require('path').basename(__filename, '.js')
  const extraConfig = require(`./${process.env.MIKA_CONFIG_GROUP ? `_configs.${process.env.MIKA_CONFIG_GROUP}` : '_configs'}/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`${configName} is mixed`)
} catch (err) {}

module.exports = baseConfig
