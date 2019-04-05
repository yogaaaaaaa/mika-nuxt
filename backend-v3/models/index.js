'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const ready = require('../helpers/ready')

const basename = path.basename(__filename)

const config = require(path.join(__dirname, '..', 'config', 'dbConfig.json'))[process.env.NODE_ENV || 'development']

let db = {}
let sequelize = null

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config)
}

ready.addModule('database')
sequelize
  .authenticate()
  .then(() => {
    ready.ready('database')
  })
  .catch((err) => {
    console.log(err)
    process.exit(1)
  })

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
