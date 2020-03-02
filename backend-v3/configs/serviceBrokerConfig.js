'use strict'

/**
 * Moleculer service broker config
 */

const commonConfig = require('configs/commonConfig')
const isEnvProduction = process.env.NODE_ENV === 'production'

let baseConfig = {
  namespace: `${commonConfig.name}`,
  nodeID: `${commonConfig.name}-${process.pid}`,
  transporter: 'mqtt://localhost',
  logger: console,
  logLevel: isEnvProduction ? 'warn' : 'info',
  logFormatter: 'simple'
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

module.exports = baseConfig
