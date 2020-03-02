'use strict'

const seeder = require('libs/seeder')

module.exports = seeder.generateCsvSyncSeeder({
  tableName: 'cardIssuer',
  baseDir: __dirname,
  filePath: 'csv/issuer.csv'
})
