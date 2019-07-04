'use strict'

/**
 * Default Dtimer Config
 */

const uid = require('../libs/uid')
const commonConfig = require('./commonConfig')
const redisConfig = require('./redisConfig')

const configName = 'dTimerConfig'

let baseConfig = {
  redisUrl: Array.isArray(redisConfig.urls) ? redisConfig.urls[0] : redisConfig.urls,
  ns: `${commonConfig.name}:dtimer`,
  nodeName: null,
  confTimeout: 5,
  maxEvents: 8,
  disabled: false
}

/**
 * Load external config file
 */
try {
  let extraConfig = require(`./_configs/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`${configName} is mixed`)
} catch (error) { }

if (!baseConfig.nodename) {
  baseConfig.nodeName = `${commonConfig.name}-${uid.randomString()}`
}

module.exports = baseConfig
