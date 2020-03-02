'use strict'

/**
 * Fraud detection API config
 */

let baseConfig = {
  url: 'http://localhost:30000/api',
  key: '9r146LFK4OnSNwHJcW5flg',
  secret: '7ca6fb47e76f8369ac6da0134b58e630'
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

module.exports = baseConfig
