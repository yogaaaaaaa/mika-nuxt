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
  customThumbnailsDir: null,
  logsDir: null,
  keysDir: null,
  staticConfigsDir: null,

  capksDir: null,
  aidsDir: null
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

baseConfig.workDir = path.resolve(baseConfig.workDir)
baseConfig.uploadsDir = baseConfig.uploadsDir || path.join(baseConfig.workDir, 'uploads')
baseConfig.cachesDir = baseConfig.cachesDir || path.join(baseConfig.workDir, 'caches')

baseConfig.assetsDir = baseConfig.assetsDir || path.join(baseConfig.workDir, 'assets')
baseConfig.thumbnailsDir = baseConfig.thumbnailsDir || path.join(baseConfig.assetsDir, 'images')
baseConfig.templatesDir = baseConfig.templatesDir || path.join(baseConfig.assetsDir, 'templates')
baseConfig.customThumbnailsDir = path.join(baseConfig.uploadsDir, 'customThumbnails')
baseConfig.logsDir = baseConfig.keysDir || path.join(baseConfig.workDir, 'logs')
baseConfig.staticConfigsDir = baseConfig.staticConfigsDir || path.join(baseConfig.assetsDir, 'configs')

baseConfig.capksDir = baseConfig.capksDir || path.join(baseConfig.staticConfigsDir, 'capks')
baseConfig.aidsDir = baseConfig.aidsDir || path.join(baseConfig.staticConfigsDir, 'aids')

baseConfig.keysDir = baseConfig.keysDir || path.join(baseConfig.workDir, 'keys')

fs.accessSync(baseConfig.workDir, fs.constants.W_OK | fs.constants.R_OK)
fs.accessSync(baseConfig.assetsDir, fs.constants.R_OK)
fs.accessSync(baseConfig.thumbnailsDir, fs.constants.R_OK)
fs.accessSync(baseConfig.staticConfigsDir, fs.constants.R_OK)

fs.accessSync(baseConfig.capksDir, fs.constants.R_OK)
fs.accessSync(baseConfig.aidsDir, fs.constants.R_OK)

if (!fs.existsSync(baseConfig.uploadsDir)) {
  fs.mkdirSync(baseConfig.uploadsDir)
}

if (!fs.existsSync(baseConfig.cachesDir)) {
  fs.mkdirSync(baseConfig.cachesDir)
}

if (!fs.existsSync(baseConfig.customThumbnailsDir)) {
  fs.mkdirSync(baseConfig.customThumbnailsDir)
}

if (!fs.existsSync(baseConfig.keysDir)) {
  fs.mkdirSync(baseConfig.keysDir)
}
fs.chmodSync(baseConfig.keysDir,
  fs.constants.S_IRUSR |
    fs.constants.S_IWUSR |
    fs.constants.S_IXUSR
)

if (!fs.existsSync(baseConfig.logsDir)) {
  fs.mkdirSync(baseConfig.logsDir)
}

module.exports = baseConfig
