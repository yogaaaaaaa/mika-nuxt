'use strict'

/**
 * Key manager config
 */

let baseConfig = {
  keyCustodianCount: 3,
  keyCustodianUnlockCount: 2,
  sessionDurationSecond: 60,
  defaultKeyFile: 'edek.json'
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

module.exports = baseConfig
