'use strict'

/**
 * Default Dtimer Config
 */

const uid = require('libs/uid')
const commonConfig = require('configs/commonConfig')
const redisConfig = require('configs/redisConfig')

let baseConfig = {
  redisUrl: Array.isArray(redisConfig.urls) ? redisConfig.urls[0] : redisConfig.urls,
  ns: `${commonConfig.name}:dtimer`,
  nodeName: null,
  confTimeout: 5,
  maxEvents: 8,
  disabled: false
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

if (!baseConfig.nodename) {
  baseConfig.nodeName = `${commonConfig.name}-${uid.randomString()}`
}

module.exports = baseConfig
