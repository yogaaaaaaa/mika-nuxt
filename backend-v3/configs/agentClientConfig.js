'use strict'

/**
 * Agent client config
 */

let baseConfig = {
  httpTimeout: 30000
}

// Put runtime generated config here

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

// Put after mix runtime generated config here
// Place any sanity check here

module.exports = baseConfig
