'use strict'

/**
 * Moleculer service broker config
 */

const commonConfig = require('./commonConfig')
const isEnvProduction = process.env.NODE_ENV === 'production'

let baseConfig = {
  namespace: `${commonConfig.name}`,
  nodeID: `${commonConfig.name}-${process.pid}`,
  transporter: 'mqtt://localhost',
  logger: console,
  logLevel: isEnvProduction ? 'warn' : 'info',
  logFormatter: 'simple'
}

/**
 * Load external config file
 */
try {
  const configName = require('path').basename(__filename, '.js')
  const extraConfig = require(`./${process.env.MIKA_CONFIG_GROUP ? `_configs.${process.env.MIKA_CONFIG_GROUP}` : '_configs'}/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`${configName} is mixed`)
} catch (error) {}

module.exports = baseConfig
