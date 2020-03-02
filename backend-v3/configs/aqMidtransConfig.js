'use strict'

/**
 * Default Midtrans acquirer Config
 */

const commonConfig = require('configs/commonConfig')

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

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

module.exports = baseConfig
