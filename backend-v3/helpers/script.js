'use strict'

const path = require('path')
const fs = require('fs')

const scriptsDir = path.join(__dirname, '..', 'scripts')
const scripts = new Map()

function loadScript (filePath, scriptName) {
  fs.readFile(filePath, (err, data) => {
    if (err) console.log(err)
    scripts.set(scriptName, data.toString('utf8'))
  })
}

async function scanDir (dirPath, dirName) {
  dirPath = path.resolve(dirPath)
  if (!dirName) {
    dirName = path.basename(dirPath)
  } else {
    dirName = dirName + '/' + path.basename(dirPath)
  }
  let promise = new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) console.log(err)
      files.forEach(file => {
        let filePath = path.join(dirPath, file)
        fs.stat(filePath, (err, stats) => {
          if (err) console.log(err)
          if (stats.isDirectory()) {
            scanDir(filePath, dirName, true)
          } else if (stats.isFile()) {
            loadScript(filePath, dirName + '/' + file)
          }
        })
      })
    })
  })
  return promise
}

scanDir(scriptsDir)

module.exports = scripts
