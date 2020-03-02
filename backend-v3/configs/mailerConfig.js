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

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

module.exports = baseConfig
