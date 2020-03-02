'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const acquirerTypeValidator = require('validators/acquirerTypeValidator')

module.exports.createAcquirerTypeMiddlewares = [
  acquirerTypeValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'acquirerType'
  })
]

module.exports.updateAcquirerTypeMiddlewares = [
  acquirerTypeValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'acquirerType',
    identifierSource: {
      path: 'params.acquirerTypeId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.getAcquirerTypesMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'acquirerType',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerTypeId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['acquirerType']
    },
    sequelizeFilterScopeParam: {
      validModels: ['acquirerType']
    }
  })
]

module.exports.deleteAcquirerTypeMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'acquirerType',
    identifierSource: {
      path: 'params.acquirerTypeId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.getAgentAcquirerTypesMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'acquirerType',
    modelScope: 'agent',
    identifierSource: {
      path: 'params.acquirerTypeId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['acquirerType']
    },
    sequelizeFilterScopeParam: {
      validModels: ['acquirerType']
    }
  })
]
