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

  tcashQrnMerchantID: '',
  tcashQrnMerchantCriteria: 'UMI',

  tcashQrnMerchantPanPrefix: '93600911002'
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

module.exports = baseConfig
