'use strict'

/**
 * Default Midtrans Payment Gateway Config
 */

const configName = 'ppMidtransConfig'

let baseConfig = {
  notifEndpoint: '/payment/midtrans/notif',
  baseUrl: 'https://api.sandbox.midtrans.com',

  midtransClientKey: 'SB-Mid-client-VsVCzQXfi43aq964',
  midtransServerKey: 'SB-Mid-server-ohKRhnChkUctCWyKvWHubiVF',
  midtransMerchantId: 'G242671487'
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
