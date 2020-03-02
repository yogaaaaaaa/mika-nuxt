'use strict'

const seeder = require('libs/seeder')

module.exports = seeder.generateCsvSyncSeeder({
  tableName: 'cardScheme',
  baseDir: __dirname,
  filePath: 'csv/scheme.csv'
})
