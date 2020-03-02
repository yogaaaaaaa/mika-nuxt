'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const acquirerOutletAgentValidator = require('validators/acquirerConfigOutletValidator')

module.exports.createAcquirerConfigOutletMiddlewares = [
  acquirerOutletAgentValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'acquirerConfigOutlet'
  })
]

module.exports.updateAcquirerConfigOutletMiddlewares = [
  acquirerOutletAgentValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'acquirerConfigOutlet',
    identifierSource: {
      path: 'params.acquirerConfigOutletId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.getAcquirerConfigOutletsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'acquirerConfigOutlet',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerConfigOutletId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['acquirerConfigOutlet']
    },
    sequelizeFilterScopeParam: {
      validModels: ['acquirerConfigOutlet', 'outlet', 'acquirerConfig']
    }
  })
]

module.exports.deleteAcquirerConfigOutletMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'acquirerConfigOutlet',
    identifierSource: {
      path: 'params.acquirerConfigOutletId',
      as: 'id',
      type: 'int'
    }
  })
]
