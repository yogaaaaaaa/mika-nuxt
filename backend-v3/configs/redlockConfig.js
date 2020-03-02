'use strict'

/**
 * Redlock Configuration
 */

let baseConfig = {
  driftFactor: 0.01,
  retryCount: 3,
  retryDelay: 100,
  retryJitter: 200
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

module.exports = baseConfig
