'use strict'

/**
 * Default Midtrans Payment Gateway Config
 */

const configName = 'ppMidtransConfig'

const appConfig = require('./appConfig')

let baseConfig = {
  notifEndpoint: '/payment/midtrans/notif',
  baseUrl: 'https://api.sandbox.midtrans.com',

  midtransClientKey: 'SB-Mid-client-VsVCzQXfi43aq964',
  midtransServerKey: 'SB-Mid-server-ohKRhnChkUctCWyKvWHubiVF',
  midtransMerchantId: 'G242671487'
}

baseConfig.notifUrl = `${appConfig.baseUrl}${baseConfig.notifEndpoint}`

/**
 * Load external config file
 */
try {
  let extraConfig = require(`./_configs/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`Config ${configName} is mixed`)
} catch (error) { }

module.exports = baseConfig
