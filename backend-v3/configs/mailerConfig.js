'use strict'

/**
 * Nodemailer config
 */

let baseConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'maven.v2@gmail.com',
    pass: 'mav3nMobile'
  }
}

/**
 * Load external config file
 */
try {
  const configName = require('path').basename(__filename, '.js')
  const extraConfig = require(`./${process.env.MIKA_CONFIG_GROUP ? `_configs.${process.env.MIKA_CONFIG_GROUP}` : '_configs'}/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`${configName} is mixed`)
} catch (error) {}

module.exports = baseConfig
