'use strict'

const configName = 'brokerConfig'

const baseConfig = require('./baseConfig')

/**
 * Default Moleculer broker config. See https://moleculer.services/docs/0.13/broker.html
 */
let config = {
  namespace: baseConfig.namespace, // Namespace for node segmentation
  nodeID: `${baseConfig.name}-${process.pid}`, // NodeID. Default value is generated from hostname and PID
  transporter: process.env['TRANSPORTER'] || 'mqtt://localhost' // Transporter config
}

/**
 * Load external config file '${configName}_extra.js' as extraConfig, in same directory
 * And create a mixin between config and extraConfig
 */
try {
  let extraConfig = require(`./${configName}_extra`)
  config = Object.assign({}, config, extraConfig)
  console.log(`config ${configName} is mixed`)
} catch (error) { }

module.exports = config
