'use strict'

/**
 * Default App Config
 * provide app name, baseurl, etc
 */

const childProcess = require('child_process')

const isEnvProduction = process.env.NODE_ENV === 'production'

let baseConfig = {
  name: isEnvProduction ? 'mika-v3' : `mika-v3-${process.env.NODE_ENV || 'development'}`,
  version: null,

  httpListenPort: 12000,

  baseUrl: isEnvProduction ? 'https://api.mikaapp.id' : 'https://stg31api.mikaapp.id',
  debugKeyHeader: 'x-mika-debug',
  debugKey: '1K24vDZGaGmJGCTTVIRyLxPPiHY',

  allowedOrigins: isEnvProduction ? ['https://backoffice.mikaapp.id', 'https://dashboard.mikaapp.id'] : '*',

  authSessionTokenHeader: 'x-access-token',
  authSecretKey: '4FoC5uMLqAkoBMSw2sOLIF7M',
  authExpirySecond: 15 * 60,
  authMaxFailedLoginAttempt: 6,
  authLockSecond: 30 * 60,
  authPasswordAgeSecond: 90 * 24 * 3600,
  authLastPasswordsCount: 4,
  authValidPassword: {
    mustContains: ['digits', 'letters'], // Possible values: digits, letters, uppercase, lowercase, symbols
    min: 8,
    max: 64,
    generatedLength: 10
  },

  thumbnailsEndpoint: '/thumbnails'
}

/**
 * Load external config file
 */
try {
  const configName = require('path').basename(__filename, '.js')
  const extraConfig = require(`./${process.env.MIKA_CONFIG_GROUP ? `_configs.${process.env.MIKA_CONFIG_GROUP}` : '_configs'}/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`${configName} is mixed`)
} catch (err) {}

if (!baseConfig.version) {
  try {
    if (isEnvProduction) {
      baseConfig.version = require('../package').version
    } else {
      const branch = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString('utf8').trim()
      const revCount = childProcess.execSync(`git rev-list ${branch} --count`).toString('utf8').trim()
      const shortHash = childProcess.execSync('git rev-parse --short HEAD').toString('utf8').trim()
      const timestamp = childProcess.execSync('git show -s --format=%ct HEAD').toString('utf8').trim()
      const commitDate = new Date(timestamp * 1000).toISOString()
      baseConfig.version = `${baseConfig.name} ${branch} ${shortHash} ${revCount} ${commitDate}`
    }
  } catch (error) {}
}

module.exports = baseConfig
