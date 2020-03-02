'use strict'

/**
 * Transaction manager config
 */

let baseConfig = {
  transactionExpirySecond: 3 * 60,
  initialAgentLockDuration: 30000,
  extendAgentLockDuration: 4000
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

module.exports = baseConfig
