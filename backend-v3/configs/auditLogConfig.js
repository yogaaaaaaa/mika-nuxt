'use strict'

const commonConfig = require('configs/commonConfig')

/**
 * Config sample/template
 */

let baseConfig = {
  elasticSearchIndex: `${(commonConfig.name.replace('-', '_'))}_audit`
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

module.exports = baseConfig
