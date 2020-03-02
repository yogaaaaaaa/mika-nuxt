'use strict'

/**
 * BNI acquirer config, via FTIE
 */

let baseConfig = {
  ftieBaseUrl: 'http://localhost:9090',

  hostTimeout: 20000, // default recommended by BNI STI is 60 seconds, we use lower
  hostRetry: 1, // Retry on Reversal
  hostSettlementRetry: 3, // Retry on Settlement
  hostAddress: 'localhost',
  hostPort: '2010',
  disableTle: false
}

// Put runtime generated config here

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

// Put after mix runtime generated config here
// Place any sanity check here

module.exports = baseConfig
