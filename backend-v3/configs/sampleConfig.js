'use strict'

/**
 * Config sample/template
 */

let baseConfig = {
  // Put your config here
}

// Put runtime generated config here

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

// Put after mix config here

// Place any sanity check here

module.exports = baseConfig
