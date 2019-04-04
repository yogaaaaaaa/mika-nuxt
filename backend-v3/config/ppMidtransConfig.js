'use strict'

const configName = 'ppMidtransConfig'

/**
 * Default Midtrans Payment Gateway Config
 */
let baseConfig = {
  notifEndpoint: '/transaction/midtrans/notif',
  baseUrl: 'https://api.sandbox.midtrans.com',
  clientKey: 'SB-Mid-client-VsVCzQXfi43aq964',
  serverKey: 'SB-Mid-server-ohKRhnChkUctCWyKvWHubiVF',
  merchantId: 'G242671487',
  serverAuth: 'Basic U0ItTWlkLXNlcnZlci1vaEtSaG5DaGtVY3RDV3lLdldIdWJpVkY6Og=='
}

/**
 * Load external config file '${configName}_extra.js' as extraConfig, in same directory
 * And create a mixin between baseConfig and extraConfig
 */
try {
  let extraBaseConfig = require(`../config/${configName}_extra`)
  baseConfig = Object.assign({}, baseConfig, extraBaseConfig)
} catch (error) { }

module.exports = baseConfig
