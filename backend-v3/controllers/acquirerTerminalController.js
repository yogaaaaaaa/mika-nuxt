'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const acquirerTerminalValidator = require('validators/acquirerTerminalValidator')

module.exports.createAcquirerTerminalMiddlewares = [
  acquirerTerminalValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'acquirerTerminal'
  })
]

module.exports.getAcquirerTerminalsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'acquirerTerminal',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerTerminalId',
      as: 'id',
      type: 'int'
    },
    sequelizeScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['acquirerTerminal']
    },
    sequelizeFilterScopeParam: {
      validModels: ['acquirerTerminal', 'acquirerTerminalCommon']
    }
  })
]

module.exports.updateAcquirerTerminalMiddlewares = [
  acquirerTerminalValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'acquirerTerminal',
    identifierSource: {
      path: 'params.acquirerTerminalId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.deleteAcquirerTerminalMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'acquirerTerminal',
    identifierSource: {
      path: 'params.acquirerTerminalId',
      as: 'id',
      type: 'int'
    }
  })
]
