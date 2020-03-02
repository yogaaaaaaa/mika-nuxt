'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const cardIssuerValidator = require('validators/cardIssuerValidator')

module.exports.createCardIssuerMiddlewares = [
  cardIssuerValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'cardIssuer'
  })
]

module.exports.getCardIssuersMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'cardIssuer',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.cardIssuerId',
      as: 'id'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['cardIssuer']
    },
    sequelizeFilterScopeParam: {
      validModels: ['cardIssuer']
    }
  })
]

module.exports.updateCardIssuerMiddlewares = [
  cardIssuerValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'cardIssuer',
    identifierSource: {
      path: 'params.cardIssuerId',
      as: 'id'
    }
  })
]

module.exports.deleteCardIssuerMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'cardIssuer',
    identifierSource: {
      path: 'params.cardIssuerId',
      as: 'id',
      type: 'int'
    }
  })
]
