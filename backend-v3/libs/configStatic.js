'use strict'

const fs = require('fs')
const path = require('path')

const dir = require('libs/dir')

const dirConfig = require('configs/dirConfig')

function loadAndMergeStaticJsonConfig (dir, type = '') {
  const loadedConfigs = []
  fs
    .readdirSync(dir)
    .filter(filename => (filename.indexOf('.') !== 0) && (filename.slice(-5) === '.json'))
    .forEach(file => {
      const filePath = path.join(dir, file)
      const newConfigs = JSON.parse(fs.readFileSync(filePath))
      if (Array.isArray(newConfigs)) {
        for (const config of newConfigs) {
          loadedConfigs.push(config)
        }
        console.log(`staticConfig: Loaded ${type} file '${file}'`)
      }
    })

  return loadedConfigs
}

module.exports.loadAndCacheAids = () => {
  const cacheFilename = 'aids.json'
  const cacheFilePath = dir.getCachesDirPath(cacheFilename)

  dir.writeCacheFile(cacheFilename, JSON.stringify(loadAndMergeStaticJsonConfig(dirConfig.aidsDir, 'aid')))

  return cacheFilePath
}

module.exports.loadAndCacheCapks = () => {
  const cacheFilename = 'capks.json'
  const cacheFilePath = dir.getCachesDirPath(cacheFilename)

  dir.writeCacheFile(cacheFilename, JSON.stringify(loadAndMergeStaticJsonConfig(dirConfig.capksDir, 'capk')))

  return cacheFilePath
}
