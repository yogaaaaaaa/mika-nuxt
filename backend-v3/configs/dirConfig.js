'use strict'

/**
 * Default Dir Config
 */

const path = require('path')
const fs = require('fs')

const configName = 'dirConfig'

let baseConfig = {
  workDir: process.env.MIKA_WORK_DIR || path.dirname(require.main.filename),
  uploadDir: process.env.MIKA_UPLOAD_DIR,
  cacheDir: process.env.MIKA_CACHE_DIR,
  assetsDir: process.env.MIKA_ASSETS_DIR || path.join(path.dirname(require.main.filename), 'assets'),
  thumbnailDir: path.join(path.dirname(require.main.filename), 'assets', 'images'),
  customThumbnailDir: null
}

/**
 * Load external config file
 */
try {
  let extraConfig = require(`./_configs/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`Config ${configName} is mixed`)
} catch (error) { }

baseConfig.workDir = path.resolve(baseConfig.workDir)
baseConfig.uploadDir = baseConfig.uploadDir || path.join(baseConfig.workDir, 'uploads')
baseConfig.cacheDir = baseConfig.cacheDir || path.join(baseConfig.workDir, 'cache')
baseConfig.customThumbnailDir = path.join(baseConfig.uploadDir, 'customThumbnails')

fs.accessSync(baseConfig.workDir, fs.constants.W_OK | fs.constants.R_OK)
fs.accessSync(baseConfig.assetsDir, fs.constants.R_OK)
fs.accessSync(baseConfig.thumbnailDir, fs.constants.R_OK)

if (!fs.existsSync(baseConfig.uploadDir)) {
  fs.mkdirSync(baseConfig.uploadDir)
}

if (!fs.existsSync(baseConfig.cacheDir)) {
  fs.mkdirSync(baseConfig.cacheDir)
}

if (!fs.existsSync(baseConfig.customThumbnailDir)) {
  fs.mkdirSync(baseConfig.customThumbnailDir)
}

module.exports = baseConfig
