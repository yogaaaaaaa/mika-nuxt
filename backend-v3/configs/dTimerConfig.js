'use strict'

/**
 * Default Dtimer Config
 */

const uid = require('../libs/uid')
const appConfig = require('./appConfig')

const dir = require('../libs/dir')

const configName = 'dTimerConfig'

let baseConfig = {
  redisUrl: Array.isArray(appConfig.redisUrls) ? appConfig.redisUrls[0] : appConfig.redisUrls,
  ns: `${appConfig.redisPrefix}dtimer`,
  nodeName: null,
  confTimeout: 5,
  maxEvents: 8,
  disabled: false
}

/**
 * Load external config file
 */
try {
  let extraConfig = require(`./_configs/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`Config ${configName} is mixed`)
} catch (error) { }

if (!baseConfig.nodename) {
  const nodenameFile = 'dTimerNodeName'
  let nodename = dir.readCacheFile(nodenameFile)
  if (nodename) {
    baseConfig.nodeName = nodename
  } else {
    baseConfig.nodeName = `${appConfig.namespace}${appConfig.name}-${uid.randomString()}`
    dir.writeCacheFile(nodenameFile, baseConfig.nodeName)
  }
}

module.exports = baseConfig
