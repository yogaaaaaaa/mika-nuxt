'use strict'

const handlebars = require('handlebars')

const dir = require('./dir')
const dirConfig = require('../configs/dirConfig')

const templateMap = new Map()

dir.loadFiles(dirConfig.templatesDir, (filePath, data) => {
  if (filePath.endsWith('.hbs')) {
    templateMap.set(filePath, handlebars.compile(data, { noEscape: true }))
  }
})

module.exports = templateMap
