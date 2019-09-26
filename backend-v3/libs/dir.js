'use strict'

const path = require('path')
const fs = require('fs')

const dirConfig = require('../configs/dirConfig')

module.exports.getWorkDirPath = (...bases) => {
  return path.join(dirConfig.workDir, ...bases)
}

module.exports.getCachesDirPath = (...bases) => {
  return path.join(dirConfig.cachesDir, ...bases)
}

module.exports.createCacheDir = (dirName) => {
  return new Promise((resolve, reject) => {
    const dirPath = exports.getCachesDirPath(dirName)
    fs.mkdir(dirPath, (err) => {
      if (err) return reject(err)
      resolve(dirPath)
    })
  })
}

/**
 * Read a file in cache directory.
 *
 * WARNING: sync function
 */
module.exports.readCacheFile = (filename, toString = true) => {
  try {
    const bufferRead = fs.readFileSync(exports.getCachesDirPath(filename))
    return (toString ? bufferRead.toString('utf8') : bufferRead)
  } catch (err) {}
}

/**
 * Simple function to write a file to cache directory.
 *
 * WARNING: sync function
 */
module.exports.writeCacheFile = (filename, data) => {
  try {
    return fs.writeFileSync(exports.getCachesDirPath(filename), data)
  } catch (err) {}
}

/**
 * Search for all files recursively on dirPath
 * with callback for each files
 *
 * callback: callback()
 *
 * WARNING: Sync function, callback can be async
 */
module.exports.loadFiles = (dirPath, callback) => {
  async function searchFiles (dirPath, callback, rootPath) {
    if (!rootPath) rootPath = dirPath
    const nodes = fs.readdirSync(dirPath)
    for (const node of nodes) {
      const nodePath = path.join(dirPath, node)
      const nodeStats = fs.statSync(nodePath)
      if (nodeStats.isDirectory()) {
        searchFiles(nodePath, callback, rootPath)
      } else if (nodeStats.isFile()) {
        if (typeof callback === 'function') {
          const filePath = path.relative(rootPath, nodePath)
          const data = fs.readFileSync(nodePath).toString('utf8')
          await callback(filePath, data)
        }
      }
    }
  }
  searchFiles(dirPath, callback)
}
