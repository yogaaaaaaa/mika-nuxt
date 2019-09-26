'use strict'

/**
 * Default Tcash QRN acquirer Config
 */

let baseConfig = {
  payInformEndpoint: '/acquirer_notif/tcashqrn/pay',

  baseUrl: 'https://tcashoauthgw.telkomsel.com',

  tcashQrnCid: '1004',
  tcashQrnSecretKey: 'linkaja#mika',
  tcashQrnPwd: 'bvu38pe4f6TZc1NRBYXCiO3C',

  tcashQrnMerchantID: '190717011155001',
  tcashQrnMerchantCriteria: 'UMI',

  tcashQrnMerchantPanPrefix: '93600911002'
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
