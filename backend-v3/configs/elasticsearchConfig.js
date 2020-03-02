'use strict'

/**
 * Elasticsearch config
 */

let baseConfig = {
  host: 'http://localhost:9200',
  apiVersion: '7.5'
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

module.exports = baseConfig
