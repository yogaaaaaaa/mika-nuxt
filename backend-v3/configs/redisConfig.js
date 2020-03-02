'use strict'

/**
 * Default Redis Config
 */

const commonConfig = require('configs/commonConfig')

let baseConfig = {
  urls: 'redis://localhost',
  prefix: null
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

const urls = baseConfig.urls.split(',')
if (urls.length > 1) baseConfig.urls = urls

if (!baseConfig.prefix) {
  baseConfig.prefix = `${commonConfig.name}:`
}

module.exports = baseConfig
