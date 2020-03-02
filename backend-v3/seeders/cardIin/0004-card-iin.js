'use strict'

const seeder = require('libs/seeder')

module.exports = seeder.generateCsvSyncSeeder({
  tableName: 'cardIin',
  baseDir: __dirname,
  filePath: 'csv/iin.csv'
})
