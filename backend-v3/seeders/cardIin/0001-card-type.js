'use strict'

const seeder = require('libs/seeder')

module.exports = seeder.generateCsvSyncSeeder({
  tableName: 'cardType',
  baseDir: __dirname,
  filePath: 'csv/type.csv'
})
