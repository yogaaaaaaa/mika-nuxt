'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const merchantValidator = require('validators/merchantValidator')

module.exports.getMerchantsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'merchant',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.merchantId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['merchant']
    },
    sequelizeFilterScopeParam: {
      validModels: ['merchant']
    }
  })
]

module.exports.createMerchantMiddlewares = [
  merchantValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'merchant',
    createHandler: async ({ crudCtx }) => {
      crudCtx.modelInstance = await crudCtx.modelScoped.createWithResources(
        crudCtx.data,
        crudCtx.modelOptions
      )
    }
  })
]

module.exports.updateMerchantMiddlewares = [
  merchantValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'merchant',
    identifierSource: {
      path: 'params.merchantId',
      as: 'id',
      type: 'int'
    }
  })
]
