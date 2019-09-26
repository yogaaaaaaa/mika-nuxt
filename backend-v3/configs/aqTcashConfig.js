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

/**
 * Load external config file
 */
try {
  const configName = require('path').basename(__filename, '.js')
  const extraConfig = require(`./${process.env.MIKA_CONFIG_GROUP ? `_configs.${process.env.MIKA_CONFIG_GROUP}` : '_configs'}/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`${configName} is mixed`)
} catch (err) {}

module.exports = baseConfig
