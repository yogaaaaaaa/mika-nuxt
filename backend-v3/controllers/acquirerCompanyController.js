'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const acquirerCompanyValidator = require('validators/acquirerCompanyValidator')

module.exports.createAcquirerCompanyMiddlewares = [
  acquirerCompanyValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'acquirerCompany'
  })
]

module.exports.getAcquirerCompaniesMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'acquirerCompany',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerCompanyId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['acquirerCompany']
    },
    sequelizeFilterScopeParam: {
      validModels: ['acquirerCompany']
    }
  })
]

module.exports.updateAcquirerCompanyMiddlewares = [
  acquirerCompanyValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'acquirerCompany',
    identifierSource: {
      path: 'params.acquirerCompanyId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.deleteAcquirerCompanyMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'acquirerCompany',
    identifierSource: {
      path: 'params.acquirerCompanyId',
      as: 'id',
      type: 'int'
    }
  })
]
