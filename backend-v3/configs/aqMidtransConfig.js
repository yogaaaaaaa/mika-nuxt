'use strict'

/**
 * Default Midtrans acquirer Config
 */

const commonConfig = require('./commonConfig')

let baseConfig = {
  notifEndpoint: '/payment/midtrans/notif',
  baseUrl: 'https://api.sandbox.midtrans.com',

  midtransClientKey: 'SB-Mid-client-VsVCzQXfi43aq964',
  midtransServerKey: 'SB-Mid-server-ohKRhnChkUctCWyKvWHubiVF',
  midtransMerchantId: 'G242671487'
}

baseConfig.notifUrl = `${commonConfig.baseUrl}${baseConfig.notifEndpoint}`

/**
 * Load external config file
 */
try {
  const configName = require('path').basename(__filename, '.js')
  let extraConfig = require(`./${process.env.MIKA_CONFIG_GROUP ? `_configs.${process.env.MIKA_CONFIG_GROUP}` : '_configs'}/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`${configName} is mixed`)
} catch (err) {}

module.exports = baseConfig
