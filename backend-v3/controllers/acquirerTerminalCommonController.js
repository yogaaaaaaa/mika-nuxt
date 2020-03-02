'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const acquirerTerminalCommonValidator = require('validators/acquirerTerminalCommonValidator')

module.exports.createAcquirerTerminalCommonMiddlewares = [
  acquirerTerminalCommonValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'acquirerTerminalCommon'
  })
]

module.exports.getAcquirerTerminalCommonsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'acquirerTerminalCommon',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerTerminalCommonId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['acquirerTerminalCommon']
    },
    sequelizeFilterScopeParam: {
      validModels: ['acquirerTerminalCommon']
    }
  })
]

module.exports.updateAcquirerTerminalCommonMiddlewares = [
  acquirerTerminalCommonValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'acquirerTerminalCommon',
    identifierSource: {
      path: 'params.acquirerTerminalCommonId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.deleteAcquirerTerminalCommonMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'acquirerTerminalCommon',
    identifierSource: {
      path: 'params.acquirerTerminalCommonId',
      as: 'id',
      type: 'int'
    }
  })
]
