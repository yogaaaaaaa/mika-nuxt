'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const cardSchemeValidator = require('validators/cardSchemeValidator')

module.exports.createCardSchemeMiddlewares = [
  cardSchemeValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'cardScheme'
  })
]

module.exports.getCardSchemesMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'cardScheme',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.cardSchemeId',
      as: 'id'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['cardScheme']
    },
    sequelizeFilterScopeParam: {
      validModels: ['cardScheme']
    }
  })
]

module.exports.updateCardSchemeMiddlewares = [
  cardSchemeValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'cardScheme',
    identifierSource: {
      path: 'params.cardSchemeId',
      as: 'id'
    }
  })
]

module.exports.deleteCardSchemeMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'cardScheme',
    identifierSource: {
      path: 'params.cardSchemeId',
      as: 'id'
    }
  })
]
