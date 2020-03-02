'use strict'

/**
 * Default TCASH/LinkAja acquirer config
 */

let baseConfig = {
  inquiryEndpoint: '/payment/tcash/inquiry',
  payEndpoint: '/payment/tcash/pay',

  tcashUser: 'mika',
  tcashMerchant: 'Mika',
  tcashTerminal: 'MIKA',
  tcashPwd: 'MIKA'
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

module.exports = baseConfig
