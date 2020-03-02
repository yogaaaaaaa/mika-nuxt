'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const terminalModelValidator = require('validators/terminalModelValidator')

module.exports.createTerminalModelMiddlewares = [
  terminalModelValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'terminalModel'
  })
]

module.exports.getTerminalModelsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'terminalModel',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.terminalModelId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['terminalModel']
    },
    sequelizeFilterScopeParam: {
      validModels: ['terminalModel']
    }
  })
]

module.exports.updateTerminalModelMiddlewares = [
  terminalModelValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'terminalModel',
    identifierSource: {
      path: 'params.terminalModelId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.deleteTerminalModelMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'terminalModel',
    identifierSource: {
      path: 'params.terminalModelId',
      as: 'id',
      type: 'int'
    }
  })
]
