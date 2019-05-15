'use strict'

/**
 * Default TCASH/LinkAja Acquirer config
 */

const configName = 'ppTcashConfig'

let baseConfig = {
  inquiryEndpoint: '/payment/tcash/inquiry',
  payEndpoint: '/payment/tcash/pay',

  tcashUser: 'mika',
  tcashMerchant: 'Mika',
  tcashTerminal: 'MIKA',
  tcashPwd: 'MIKA'
}

/**
 * Load external config file
 */
try {
  let extraConfig = require(`./_configs/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`Config ${configName} is mixed`)
} catch (error) { }

module.exports = baseConfig
