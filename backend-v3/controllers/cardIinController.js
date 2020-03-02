'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const cardIinValidator = require('validators/cardIinValidator')

module.exports.createCardIinMiddlewares = [
  cardIinValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'cardIin'
  })
]

module.exports.getCardIinsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'cardIin',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.cardIinId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['cardIin']
    },
    sequelizeFilterScopeParam: {
      validModels: ['cardIin', 'cardScheme', 'cardIssuer']
    }
  })
]

module.exports.searchCardIinMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'cardIin',
    modelScope: ({ crudCtx }) => ([
      'info',
      { method: ['findPattern', crudCtx.getSecondaryIdentifier({ path: 'query.account_number' })] }
    ]),
    identifierSource: {
      path: 'params.cardIinId',
      as: 'id',
      type: 'int'
    },
    sequelizePaginationScopeParam: {
      validModels: ['cardIin']
    },
    sequelizeFilterScopeParam: {
      validModels: ['cardIin', 'cardScheme', 'cardIssuer', 'cardType']
    }
  })
]

module.exports.updateCardIinMiddlewares = [
  cardIinValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'cardIin',
    identifierSource: {
      path: 'params.cardIinId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.deleteCardIinMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'cardIin',
    identifierSource: {
      path: 'params.cardIinId',
      as: 'id',
      type: 'int'
    }
  })
]
