'use strict'

/**
 * Default fairpay acquirer config
 */

const configName = 'aqFairpayConfig'

const appConfig = require('./appConfig')

let baseConfig = {
  baseUrl: 'http://autobot.dlinkddns.com:28028',
  username: 'fajar',
  password: '123456789',
  auth_code: 'Murdoc',
  device_id: '09100603786987000300',
  pin_ipek: '2981D04AE7AEF703678DDEE052CA64BD',
  pin_ksn: '727FB4F325B5F1E00000',
  track_ksn: '1D88799D520290E00000',
  track_ipek: '2AC4172661C698834218B09D3E6F00F9',
  emv_ipek: '9889AE89A053EDD31DBE40ED03B39F90',
  emv_ksn: '6700CAED48735CE00000',
  last_key_download: '2018-11-14 04:56:41',
  redisPrefix: `${appConfig.name}-fpPG`
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
