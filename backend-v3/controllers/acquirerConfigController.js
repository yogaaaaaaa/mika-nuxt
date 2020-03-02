'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const acquirerConfigValidator = require('validators/acquirerConfigValidator')

module.exports.createAcquirerConfigMiddlewares = [
  acquirerConfigValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'acquirerConfig'
  })
]

module.exports.updateAcquirerConfigMiddlewares = [
  acquirerConfigValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'acquirerConfig',
    identifierSource: {
      path: 'params.acquirerConfigId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.getAcquirerConfigsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'acquirerConfig',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerConfigId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['acquirerConfig']
    },
    sequelizeFilterScopeParam: {
      validModels: ['acquirerConfig']
    }
  })
]

module.exports.deleteAcquirerConfigMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'acquirerConfig',
    identifierSource: {
      path: 'params.acquirerConfigId',
      as: 'id',
      type: 'int'
    }
  })
]
