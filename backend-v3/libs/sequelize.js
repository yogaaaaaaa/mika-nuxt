'use strict'

const Sequelize = require('sequelize')
const ready = require('../libs/ready')

const dbConfig = require('../configs/dbConfig')
let selectedDbConfig

if (dbConfig[process.env.NODE_ENV]) {
  selectedDbConfig = dbConfig[process.env.NODE_ENV]
} else {
  selectedDbConfig = dbConfig.development
}

const sequelize = new Sequelize(
  selectedDbConfig.database,
  selectedDbConfig.username,
  selectedDbConfig.password,
  selectedDbConfig
)

console.log('Database:', sequelize.getDatabaseName())

ready.addModule('database')
sequelize
  .authenticate()
  .then(() => ready.ready('database'))

module.exports = sequelize
