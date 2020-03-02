'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const cardTypeValidator = require('validators/cardTypeValidator')

module.exports.createCardTypeMiddlewares = [
  cardTypeValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'cardType'
  })
]

module.exports.getCardTypesMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'cardType',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.cardTypeId',
      as: 'id'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['cardType'],
      allowNoPagination: true
    },
    sequelizeFilterScopeParam: {
      validModels: ['cardType']
    }
  })
]

module.exports.updateCardTypeMiddlewares = [
  cardTypeValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'cardType',
    identifierSource: {
      path: 'params.cardTypeId',
      as: 'id'
    }
  })
]

module.exports.deleteCardTypeMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'cardType',
    identifierSource: {
      path: 'params.cardTypeId',
      as: 'id'
    }
  })
]
