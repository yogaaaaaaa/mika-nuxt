'use strict'

/**
 * Automatically load scripts to map object
 */

const path = require('path')
const fs = require('fs')

function stringTransform (string, newLineToSpace, singleSpace) {
  if (newLineToSpace) {
    string = string.replace(/[\n\r]+/g, ' ')
  }
  if (singleSpace) {
    string = string.replace(/ {1,}/g, ' ')
  }
  return string
}

function processScript (filepath, script) {
  let extension = path.extname(filepath).toLowerCase()
  switch (extension) {
    case '.sql':
      script = stringTransform(script, true, true)
      break
    default:
      break
  }
  return script
}

function loadScripts (dirPath, map, rootPath) {
  if (!rootPath) rootPath = dirPath
  let nodes = fs.readdirSync(dirPath)
  for (const node of nodes) {
    let nodePath = path.join(dirPath, node)
    let nodeStats = fs.statSync(nodePath)
    if (nodeStats.isDirectory()) {
      loadScripts(nodePath, map, rootPath)
    } else if (nodeStats.isFile()) {
      let scriptPath = path.relative(rootPath, nodePath)
      let processedScript = processScript(scriptPath, fs.readFileSync(nodePath).toString('utf8'))
      map.set(
        scriptPath,
        processedScript
      )
    }
  }
  return map
}

module.exports.map = loadScripts(path.resolve(path.join(__dirname, '..', 'scripts')), new Map())

module.exports.get = (name, replacements) => {
  let script = exports.map.get(name)
  if (Array.isArray(replacements)) {
    let i = 0
    console.log(script)
    console.log(replacements)
    script = script.split('?').reduce((acc, v) => {
      let retval = `${acc}${replacements[i]}${v}`
      i++
      return retval
    })
  }
  return script
}
