'use strict'

/**
 * Automatically load scripts to map then exports it
 */

const path = require('path')
const fs = require('fs')

const ready = require('./ready')
ready.addModule('scripts')

const scriptsDir = path.join(__dirname, '..', 'scripts')
const scripts = new Map()

function loadScript (filePath, scriptName) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err)
      scripts.set(scriptName, data.toString('utf8'))

      resolve()
    })
  })
}

async function stat (filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, async (err, stats) => {
      if (err) reject(err)
      resolve(stats)
    })
  })
}

async function scanDir (dirPath, dirName) {
  dirPath = path.resolve(dirPath)
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, async (err, files) => {
      if (err) reject(err)

      for (const file of files) {
        let filePath = path.join(dirPath, file)
        let fileStats = await stat(filePath)

        if (fileStats.isDirectory()) {
          if (!dirName) {
            dirName = path.basename(dirPath)
          } else {
            dirName = dirName + '/' + path.basename(dirPath)
          }
          await scanDir(filePath, dirName)
        } else if (fileStats.isFile()) {
          if (dirName) {
            await loadScript(filePath, dirName + '/' + file)
          } else {
            await loadScript(filePath, file)
          }
        }
      }

      resolve()
    })
  })
}

scanDir(scriptsDir)
  .then(() => ready.ready('scripts'))

module.exports = scripts
