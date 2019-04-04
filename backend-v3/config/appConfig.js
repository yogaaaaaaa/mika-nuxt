'use strict'

const configName = 'appConfig'

/**
 * Default App Config
 * provide app name, baseurl, and more to come
 */
let baseConfig = {
  name: process.env.MIKA_APP_NAME || (process.env.NODE_ENV === 'development' ? 'mika-v3-dev' : 'mika-v3'),
  baseUrl: process.env.MIKA_APP_BASE_URL || (process.env.NODE_ENV === 'development' ? 'https://stg12api.mikaapp.id' : 'https://api.mikaapp.id'),
  debugHeader: 'x-mika-debug',
  sessionTokenHeader: 'x-access-token',
  debugKey: process.env.MIKA_APP_DEBUG_KEY || 'debug_mika',
  listenPort: process.env.MIKA_APP_PORT || 12000,
  appPrefixPath: process.env.MIKA_API_PREFIX_PATH || '/'
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
