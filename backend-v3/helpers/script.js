'use strict'

/**
 * Automatically load scripts to map object
 */

const path = require('path')
const fs = require('fs')

const scriptsDir = path.resolve(path.join(__dirname, '..', 'scripts'))

function loadScripts (dirPath, map, rootPath) {
  if (!rootPath) rootPath = dirPath
  let nodes = fs.readdirSync(dirPath)
  for (const node of nodes) {
    let nodePath = path.join(dirPath, node)
    let nodeStats = fs.statSync(nodePath)
    if (nodeStats.isDirectory()) {
      loadScripts(nodePath, map, rootPath)
    } else if (nodeStats.isFile()) {
      map.set(
        path.relative(rootPath, nodePath),
        fs.readFileSync(nodePath).toString('utf8')
      )
    }
  }
  return map
}

module.exports = loadScripts(scriptsDir, new Map())
