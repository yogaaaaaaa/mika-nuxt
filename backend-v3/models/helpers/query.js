'use strict'

const path = require('path')
const fs = require('fs')

const string = require('../../libs/string')

function processScript (filepath, script) {
  const extension = path.extname(filepath).toLowerCase()
  switch (extension) {
    case '.sql':
      script = string.whitespaceTrim(script, true, true)
      break
    default:
      script = null
      break
  }
  return script
}

function loadScripts (dirPath, map, rootPath) {
  if (!rootPath) rootPath = dirPath
  const nodes = fs.readdirSync(dirPath)
  for (const node of nodes) {
    const nodePath = path.join(dirPath, node)
    const nodeStats = fs.statSync(nodePath)
    if (nodeStats.isDirectory()) {
      loadScripts(nodePath, map, rootPath)
    } else if (nodeStats.isFile()) {
      const scriptPath = path.relative(rootPath, nodePath)
      const processedScript = processScript(scriptPath, fs.readFileSync(nodePath).toString('utf8'))
      if (processedScript) {
        map.set(
          scriptPath,
          processedScript
        )
      }
    }
  }
  return map
}

module.exports.map = loadScripts(path.resolve(path.join(__dirname, '..', 'queries')), new Map())

module.exports.get = (name, replacements) => {
  let script = exports.map.get(name)
  if (Array.isArray(replacements)) {
    let i = 0
    script = script.split('?').reduce((acc, v) => {
      const retval = `${acc}${replacements[i]}${v}`
      i++
      return retval
    })
  }
  return script
}
