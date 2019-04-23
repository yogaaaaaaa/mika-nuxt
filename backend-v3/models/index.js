'use strict'

/**
 * Sequelize model loader
 */

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const ready = require('../helpers/ready')
ready.addModule('database')

const basename = path.basename(__filename)

const config = require('../configs/dbConfig')[process.env.NODE_ENV || 'development']
console.log('Database:', config.database)

let models = {}

let sequelize = new Sequelize(config.database, config.username, config.password, config)
sequelize
  .authenticate()
  .then(() => {
    ready.ready('database')
  })

fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach(file => {
    let model = sequelize.import(path.join(__dirname, file))
    models[model.name] = model
  })

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models)
    models[modelName].addScope('defaultScope', {
      attributes: { exclude: ['deletedAt'] }
    })
    models[modelName].addScope('excludeTimestamp', {
      attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt'] }
    })
    models[modelName].addScope('onlyTimestamp', {
      attributes: ['createdAt', 'updatedAt']
    })
    models[modelName].addScope('excludeId', {
      attributes: { exclude: ['id'] }
    })
    models[modelName].addScope('onlyId', {
      attributes: ['id']
    })
  }
})

models.sequelize = sequelize
models.Sequelize = Sequelize

module.exports = models
