'use strict'

const fs = require('fs')
const path = require('path')
const sequelize = require('../libs/sequelize')

const basename = path.basename(__filename)

let models = {}

fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach(file => {
    let model = sequelize.import(path.join(__dirname, file))
    models[model.name] = model
  })

for (const modelName of Object.keys(models)) {
  models[modelName].addScope('excludeTimestamp', {
    attributes: { exclude: ['archivedAt', 'createdAt', 'updatedAt'] }
  })
  models[modelName].addScope('excludeDeletedAt', {
    attributes: { exclude: ['archivedAt'] }
  })
  models[modelName].addScope('excludeId', {
    attributes: { exclude: ['id'] }
  })
  models[modelName].addScope('id', {
    attributes: ['id']
  })
  models[modelName].addScope('paranoid', {
    paranoid: false
  })

  if (models[modelName].associate) {
    models[modelName].associate(models)
  }
}

models.sequelize = sequelize
models.Sequelize = sequelize.Sequelize

module.exports = models
