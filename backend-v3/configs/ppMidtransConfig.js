'use strict'

/**
 * Default Midtrans Payment Gateway Config
 */

const configName = 'ppMidtransConfig'

let baseConfig = {
  notifEndpoint: '/payment/midtrans/notif',
  baseUrl: 'https://api.sandbox.midtrans.com',
  clientKey: 'SB-Mid-client-VsVCzQXfi43aq964',
  serverKey: 'SB-Mid-server-ohKRhnChkUctCWyKvWHubiVF',
  merchantId: 'G242671487',
  serverAuth: 'Basic U0ItTWlkLXNlcnZlci1vaEtSaG5DaGtVY3RDV3lLdldIdWJpVkY6Og=='
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
