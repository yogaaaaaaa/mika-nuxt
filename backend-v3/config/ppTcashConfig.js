'use strict'

const configName = 'pgTcashConfig'

/**
 * Default TCASH/LinkAja Config
 */
let baseConfig = {
  inquiryEndpoint: '/payment/tcash/inquiry',
  payEndpoint: '/payment/tcash/pay',
  username: 'mika',
  password: 'MIKA'
}

/**
 * Load external config file '${configName}_extra.js' as extraConfig, in same directory
 * And create a mixin between baseConfig and extraConfig
 */
try {
  let extraBaseConfig = require(`./${configName}_extra`)
  baseConfig = Object.assign({}, baseConfig, extraBaseConfig)
  console.log(`config ${configName} is mixed`)
} catch (error) { }

module.exports = baseConfig
