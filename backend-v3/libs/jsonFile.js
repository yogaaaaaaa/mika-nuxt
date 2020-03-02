'use strict'

const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

module.exports.load = async (filepath) => {
  const data = await readFile(filepath)
  return JSON.parse(data)
}

module.exports.save = async (filepath, content) => {
  const data = JSON.stringify(content)
  await writeFile(filepath, data)
}
