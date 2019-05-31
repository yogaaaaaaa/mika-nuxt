'use strict'

const path = require('path')
const fs = require('fs')

const dirConfig = require('../configs/dirConfig')

module.exports.getCachePath = (basename) => {
  return path.join(dirConfig.cacheDir, basename)
}

module.exports.getWorkDirPath = (basename) => {
  return path.join(dirConfig.workDir, basename)
}

/**
 * Read a file in cache directory
 * WARNING: sync
 */
module.exports.readCacheFile = (filename, toString = true) => {
  try {
    let bufferRead = fs.readFileSync(exports.getCachePath(filename))
    return (toString ? bufferRead.toString('utf8') : bufferRead)
  } catch (err) {}
}

/**
 * Simple function to write a file to cache directory
 * WARNING: sync
 */
module.exports.writeCacheFile = (filename, data) => {
  try {
    return fs.writeFileSync(exports.getCachePath(filename), data)
  } catch (err) {}
}
