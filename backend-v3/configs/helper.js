'use strict'

const _ = require('lodash')
const path = require('path')

function loadAndMerge (currentFilepath, baseConfig, mergeMethod) {
  try {
    const configName = path.basename(currentFilepath, '.js')
    const extraConfigDir = process.env.MIKA_CONFIG_GROUP ? `_configs.${process.env.MIKA_CONFIG_GROUP}` : '_configs'
    const extraConfigPath = path.resolve(__dirname, extraConfigDir, configName)
    const extraConfig = require(extraConfigPath)
    if (mergeMethod === 'nested') {
      baseConfig = _.merge(baseConfig, extraConfig)
    } else {
      baseConfig = Object.assign(baseConfig, extraConfig)
    }
    console.log(`Config: '${configName}' is mixed`)
  } catch (err) {}
  return baseConfig
}

/**
 * Load external config file from this directory
 */
module.exports.loadAndMerge =
  (currentFilepath, baseConfig = {}) => loadAndMerge(currentFilepath, baseConfig)

/**
 * Load external config file from this directory
 * with nested method
 */
module.exports.loadAndNestedMerge =
  (currentFilepath, baseConfig = {}) => loadAndMerge(currentFilepath, baseConfig, 'nested')
