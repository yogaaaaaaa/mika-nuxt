'use strict'

const crypto = require('crypto')
const appConfig = require('./appConfig')

const configName = 'dTimerConfig'

/**
 * Default Dtimer Config
 */
let baseConfig = {
  nodeName: `${appConfig.name}-dtimer-node-${process.env.MIKA_DTIMER_CONFIG_NODE_NAME || Buffer.from(crypto.randomBytes(6)).toString('base64')}`,
  ns: process.env.MIKA_DTIMER_CONFIG_NAMESPACE || `${appConfig.name}-dtimer`,
  confTimeout: 5,
  maxEvents: 8
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
