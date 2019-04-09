'use strict'

/**
 * Automatically load scripts to map object
 */

const path = require('path')
const fs = require('fs')

const ready = require('./ready')
ready.addModule('scripts')

const scriptsDir = path.join(__dirname, '..', 'scripts')
const scripts = new Map()

function loadScript (filePath, rootPath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err)
      scripts.set(path.relative(rootPath, filePath), data.toString('utf8'))
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

async function scanDir (dirPath, rootPath) {
  if (!rootPath) rootPath = dirPath
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, async (err, nodes) => {
      if (err) reject(err)

      for (const node of nodes) {
        let nodePath = path.join(dirPath, node)
        let nodeStats = await stat(nodePath)

        if (nodeStats.isDirectory()) {
          await scanDir(nodePath, rootPath)
        } else if (nodeStats.isFile()) {
          await loadScript(nodePath, rootPath)
        }
      }

      resolve()
    })
  })
}

scanDir(path.resolve(scriptsDir))
  .then(() => ready.ready('scripts'))

module.exports = scripts
