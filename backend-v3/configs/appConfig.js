'use strict'

/**
 * Default App Config
 * provide app name, baseurl, etc
 */

const childProcess = require('child_process')

const configName = 'appConfig'

let baseConfig = {
  name: process.env.MIKA_NAME || (process.env.NODE_ENV === 'development' ? 'mika-v3-dev' : 'mika-v3'),
  namespace: process.env.MIKA_NAMESPACE || '',
  version: null,

  httpListenPort: process.env.MIKA_PORT || 12000,

  baseUrl: process.env.MIKA_BASE_URL || (process.env.NODE_ENV === 'development' ? 'https://stg12api.mikaapp.id' : 'https://api.mikaapp.id'),
  debugKeyHeader: 'x-mika-debug',
  debugKey: process.env.MIKA_DEBUG_KEY || '1K24vDZGaGmJGCTTVIRyLxPPiHY',

  allowedOrigin: process.env.MIKA_ALLOWED_ORIGIN || (process.env.NODE_ENV === 'development' ? '*' : 'https://api.mikaapp.id'),

  transactionExpirySecond: 200,

  authSessionTokenHeader: 'x-access-token',
  authSecretKey: process.env.MIKA_AUTH_SECRET_KEY || 'mika_secret_key',
  authExpirySecond: process.env.MIKA_AUTH_EXPIRY || 21600,
  authSessionLimit: 5,

  redisUrls: process.env.MIKA_REDIS_URLS || 'redis://localhost',
  redisPrefix: process.env.MIKA_REDIS_PREFIX || null
}

/**
 * Load external config file
 */
try {
  let extraConfig = require(`./_configs/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`Config ${configName} is mixed`)
} catch (error) {}

let redisUrls = baseConfig.redisUrls.split(',')
if (redisUrls.length > 1) baseConfig.redisUrls = redisUrls

if (!baseConfig.redisPrefix) baseConfig.redisPrefix = `${baseConfig.name}:`
baseConfig.redisPrefix = `${baseConfig.namespace}${baseConfig.redisPrefix}`

if (!baseConfig.version) {
  try {
    let branch = childProcess.execSync('git branch').toString('utf8').replace(/\*/g, '').trim().split('\n')[0]
    let revCount = childProcess.execSync(`git rev-list ${branch} --count`).toString('utf8').trim()
    let shortHash = childProcess.execSync(`git rev-parse --short HEAD`).toString('utf8').trim()
    let timestamp = childProcess.execSync(`git show -s --format=%ct HEAD`).toString('utf8').trim()
    let commitDate = new Date(timestamp * 1000).toISOString()
    if (process.env.NODE_ENV === 'production') {
      if (branch === 'master') {
        baseConfig.version = `${baseConfig.name}-${revCount} ${commitDate}`
      } else {
        baseConfig.version = `${baseConfig.name} ${commitDate}`
      }
    } else {
      baseConfig.version = `${branch}-${shortHash}-${revCount} ${process.env.NODE_ENV} ${commitDate}`
    }
  } catch (error) {}
}

module.exports = baseConfig
