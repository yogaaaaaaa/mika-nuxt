'use strict'

const debug = require('debug')('mika:database')
const Sequelize = require('sequelize')
const ready = require('libs/ready')

const dbConfig = require('configs/dbConfig')

const selectedDbConfig = dbConfig[process.env.NODE_ENV] || dbConfig.development

if (selectedDbConfig.logging) {
  selectedDbConfig.logging = (sql, data) => {
    debug(sql)
    if (typeof data === 'number') debug('Elapsed times:', data, 'ms')
  }
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
