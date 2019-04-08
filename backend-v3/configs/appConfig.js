'use strict'

/**
 * Default App Config
 * provide app name, baseurl, and more to come
 */

const path = require('path')
const fs = require('fs')

const configName = 'appConfig'

let baseConfig = {
  name: process.env.MIKA_NAME || (process.env.NODE_ENV === 'development' ? 'mika-v3-dev' : 'mika-v3'),
  baseUrl: process.env.MIKA_BASE_URL || (process.env.NODE_ENV === 'development' ? 'https://stg12api.mikaapp.id' : 'https://api.mikaapp.id'),
  debugHeader: 'x-mika-debug',
  debugKey: process.env.MIKA_DEBUG_KEY || 'debug_mika',
  sessionTokenHeader: 'x-access-token',
  httpListenPort: process.env.MIKA_PORT || 12000,

  workDir: process.env.MIKA_WORK_DIR || path.dirname(require.main.filename),
  uploadDir: null,
  cacheDir: null,

  allowedOrigin: process.env.MIKA_ALLOWED_ORIGIN || '*',

  transactionTimeoutSecond: 200,

  authExpirySecond: process.env.MIKA_API_AUTH_EXPIRY || 21600,
  authSecretKey: process.env.MIKA_AUTH_SECRET_KEY || 'mika_secret_key',

  redisUrls: process.env.MIKA_REDIS_URLS || 'redis://localhost',
  redisPrefix: process.env.MIKA_REDIS_PREFIX || null,

  getCachePath (basename) {
    return path.join(this.cacheDir, basename)
  },

  getWorkDirPath (basename) {
    return path.join(this.workDir, basename)
  },

  /**
  * Simple helper to read a file in cache directory
  *
  * WARNING: sync
  */
  readCacheFile (filename, toString = true) {
    try {
      return fs.readFileSync(this.getCachePath(filename)).toString('utf8')
    } catch (err) {}
  },

  /**
  * Simple function to write a file to cache directory
  *
  * WARNING: sync
  */
  writeCacheFile (filename, data) {
    try {
      return fs.writeFileSync(this.getCachePath(filename), data)
    } catch (err) {}
  }
}

baseConfig.workDir = path.resolve(baseConfig.workDir)
baseConfig.uploadDir = process.env.MIKA_UPLOAD_DIR || path.join(baseConfig.workDir, 'uploads')
baseConfig.cacheDir = process.env.MIKA_CACHE_DIR || path.join(baseConfig.workDir, 'cache')

let redisUrls = baseConfig.redisUrls.split(',')
if (redisUrls.length > 1) {
  baseConfig.redisUrls = redisUrls
}

if (!baseConfig.redisPrefix) {
  baseConfig.redisPrefix = `${baseConfig.name}:`
}

/**
 * Load external config file
 */
try {
  let extraConfig = require(`./_configs/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`Config ${configName} is mixed`)
} catch (error) { }

/**
 * Sanity check
 */
fs.accessSync(baseConfig.workDir, fs.constants.W_OK | fs.constants.R_OK)
if (!fs.existsSync(baseConfig.uploadDir)) {
  fs.mkdirSync(baseConfig.uploadDir)
}
if (!fs.existsSync(baseConfig.cacheDir)) {
  fs.mkdirSync(baseConfig.cacheDir)
}

module.exports = baseConfig