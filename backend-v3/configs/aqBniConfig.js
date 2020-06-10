'use strict'

/**
 * BNI acquirer config, via FTIE
 */

let baseConfig = {
  ftieBaseUrl: 'http://localhost:9090',

  hostTimeout: 20000, // Default recommended by BNI STI is 60 seconds, we use lower
  hostReverseRetry: 1, // Retry on sale and void Reversal, 0 means no automatic reversal
  hostSettlementRetry: 3, // Retry on settlement message (settlement and batch upload), 0 means no retry at all

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
