'use strict'

/**
 * Default Dir Config
 */

const path = require('path')
const fs = require('fs')

let baseConfig = {
  workDir: process.env.MIKA_WORK_DIR || path.join(__dirname, '..'),
  uploadsDir: null,
  cachesDir: null,
  assetsDir: null,
  templatesDir: null,
  thumbnailsDir: null,
  customThumbnailsDir: null
}

/**
 * Load external config file
 */
try {
  const configName = require('path').basename(__filename, '.js')
  let extraConfig = require(`./${process.env.MIKA_CONFIG_GROUP ? `_configs.${process.env.MIKA_CONFIG_GROUP}` : '_configs'}/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`${configName} is mixed`)
} catch (error) {}

baseConfig.workDir = path.resolve(baseConfig.workDir)
baseConfig.uploadsDir = baseConfig.uploadsDir || path.join(baseConfig.workDir, 'uploads')
baseConfig.cachesDir = baseConfig.cachesDir || path.join(baseConfig.workDir, 'caches')

baseConfig.assetsDir = baseConfig.assetsDir || path.join(baseConfig.workDir, 'assets')
baseConfig.thumbnailsDir = baseConfig.thumbnailsDir || path.join(baseConfig.assetsDir, 'images')
baseConfig.templatesDir = baseConfig.templatesDir || path.join(baseConfig.assetsDir, 'templates')
baseConfig.customThumbnailsDir = path.join(baseConfig.uploadsDir, 'customThumbnails')

fs.accessSync(baseConfig.workDir, fs.constants.W_OK | fs.constants.R_OK)
fs.accessSync(baseConfig.assetsDir, fs.constants.R_OK)
fs.accessSync(baseConfig.thumbnailsDir, fs.constants.R_OK)

if (!fs.existsSync(baseConfig.uploadsDir)) {
  fs.mkdirSync(baseConfig.uploadsDir)
}

if (!fs.existsSync(baseConfig.cachesDir)) {
  fs.mkdirSync(baseConfig.cachesDir)
}

if (!fs.existsSync(baseConfig.customThumbnailsDir)) {
  fs.mkdirSync(baseConfig.customThumbnailsDir)
}

module.exports = baseConfig
