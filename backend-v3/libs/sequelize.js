'use strict'

const Sequelize = require('sequelize')

const ready = require('../libs/ready')

const config = require('../configs/dbConfig')[process.env.NODE_ENV || 'development']
console.log('Database:', config.database)

let sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
)

ready.addModule('database')
sequelize
  .authenticate()
  .then(() => {
    ready.ready('database')
  })

module.exports = sequelize
