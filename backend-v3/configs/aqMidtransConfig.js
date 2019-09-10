'use strict'

/**
 * Default Midtrans acquirer Config
 */

const commonConfig = require('./commonConfig')

const isEnvProduction = process.NODE_ENV === 'production'

let baseConfig = {
  notifEndpoint: '/acquirer_notif/midtrans',
  baseUrl: isEnvProduction ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com',
  sandboxBaseUrl: 'https://simulator.sandbox.midtrans.com',

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
