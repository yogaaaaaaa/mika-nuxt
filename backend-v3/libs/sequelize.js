'use strict'

const Sequelize = require('sequelize')
const ready = require('../libs/ready')

const dbConfig = require('../configs/dbConfig')
let selectedConfig

if (dbConfig[process.env.NODE_ENV]) {
  selectedConfig = dbConfig[process.env.NODE_ENV]
} else {
  selectedConfig = dbConfig.development
}

let sequelize = new Sequelize(
  selectedConfig.database,
  selectedConfig.username,
  selectedConfig.password,
  selectedConfig
)

console.log('Database:', sequelize.getDatabaseName())

ready.addModule('database')
sequelize
  .authenticate()
  .then(() => ready.ready('database'))

module.exports = sequelize
