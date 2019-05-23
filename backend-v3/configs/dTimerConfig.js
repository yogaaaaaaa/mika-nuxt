'use strict'

/**
 * Default Dtimer Config
 */

const uid = require('../libs/uid')
const appConfig = require('./appConfig')

const configName = 'dTimerConfig'

let baseConfig = {
  redisUrl: Array.isArray(appConfig.redisUrls) ? appConfig.redisUrls[0] : appConfig.redisUrls,
  ns: `${appConfig.redisPrefix}dtimer`,
  nodeName: null,
  confTimeout: 5,
  maxEvents: 8,
  disabled: false
}

if (!baseConfig.nodename) {
  const nodenameFile = 'dTimerNodeName'
  let nodename = appConfig.readCacheFile(nodenameFile)
  if (nodename) {
    baseConfig.nodeName = nodename
  } else {
    baseConfig.nodeName = `${appConfig.name}-${uid.randomString()}`
    appConfig.writeCacheFile(nodenameFile, baseConfig.nodeName)
  }
}

/**
 * Load external config file
 */
try {
  let extraConfig = require(`./_configs/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`Config ${configName} is mixed`)
} catch (error) { }

if (baseConfig.disabled) {
  console.log('dtimer is disabled')
}

module.exports = baseConfig
