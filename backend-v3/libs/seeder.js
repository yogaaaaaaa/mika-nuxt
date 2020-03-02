'use script'

const fs = require('fs')
const path = require('path')
const csvParseSync = require('csv-parse/lib/sync')

module.exports.generateCsvSyncSeeder = ({ tableName, baseDir, filePath }) => {
  const csvFilePath = path.join(baseDir, filePath)

  return {
    up: async (queryInterface, Sequelize) => {
      const data = csvParseSync(fs.readFileSync(csvFilePath), {
        columns: true,
        skip_empty_lines: true
      }).map(object => {
        const newObject = {}
        Object.keys(object).forEach(objectEl => {
          let val = object[objectEl]
          if (!val) val = null
          newObject[objectEl] = val
        })
        return newObject
      })
      return queryInterface.bulkInsert(tableName, data, {})
    },
    down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete(tableName, null, {})
    }
  }
}
