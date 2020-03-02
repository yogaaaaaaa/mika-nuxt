'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const partnerValidator = require('validators/partnerValidator')

module.exports.createPartnerMiddlewares = [
  partnerValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'partner'
  })
]

module.exports.updatePartnerMiddlewares = [
  partnerValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'partner',
    identifierSource: {
      path: 'params.partnerId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.getPartnersMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'partner',
    modelScope: 'admin',
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['partner']
    },
    sequelizeFilterScopeParam: {
      validModels: ['partner']
    }
  })
]

module.exports.deletePartnerMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'partner',
    identifierSource: {
      path: 'params.partnerId',
      as: 'id',
      type: 'int'
    }
  })
]
