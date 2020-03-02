'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const acquirerConfigAgentValidator = require('validators/acquirerConfigAgentValidator')

module.exports.createAcquirerConfigAgentMiddlewares = [
  acquirerConfigAgentValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'acquirerConfigAgent'
  })
]

module.exports.updateAcquirerConfigAgentMiddlewares = [
  acquirerConfigAgentValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'acquirerConfigAgent',
    identifierSource: {
      path: 'params.acquirerConfigAgentId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.getAcquirerConfigAgentsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'acquirerConfigAgent',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerConfigAgentId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['acquirerConfigAgent']
    },
    sequelizeFilterScopeParam: {
      validModels: ['acquirerConfigAgent', 'agent', 'acquirerConfig', 'acquirerTerminal', 'acquirerTerminalConfig']
    }
  })
]

module.exports.deleteAcquirerConfigAgentMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'acquirerConfigAgent',
    identifierSource: {
      path: 'params.acquirerConfigAgentId',
      as: 'id',
      type: 'int'
    }
  })
]
