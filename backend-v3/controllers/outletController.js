'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const outletValidator = require('validators/outletValidator')

module.exports.createOutletMiddlewares = [
  outletValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'outlet',
    createHandler: async ({ crudCtx }) => {
      crudCtx.modelInstance = await crudCtx.modelScoped.createWithResources(
        crudCtx.data,
        crudCtx.modelOptions
      )
    }
  })
]

module.exports.updateOutletMiddlewares = [
  outletValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'outlet',
    identifierSource: {
      path: 'params.outletId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.getOutletsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'outlet',
    modelScope: ({ crudCtx }) => {
      const merchantStaffId = crudCtx.getSecondaryIdentifier({
        path: 'params.merchantStaffId',
        type: 'int'
      })
      const excludeMerchantStaffId = crudCtx.getSecondaryIdentifier({
        path: 'params.excludeMerchantStaffId',
        type: 'int'
      })
      return {
        method: [
          'admin',
          merchantStaffId || excludeMerchantStaffId,
          !!excludeMerchantStaffId
        ]
      }
    },
    identifierSource: {
      path: 'params.outletId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['outlet']
    },
    sequelizeFilterScopeParam: {
      validModels: ['outlet']
    }
  })
]

module.exports.getMerchantStaffOutletsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'outlet',
    modelScope: ({ req }) =>
      ({ method: ['merchantStaff', req.auth.merchantStaffId] }),
    identifierSource: {
      path: 'params.outletId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['outlet']
    },
    sequelizeFilterScopeParam: {
      validModels: ['outlet']
    }
  })
]

module.exports.getAcquirerStaffOutletsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'outlet',
    modelScope: ({ req }) =>
      ({ method: ['acquirerStaff', req.auth.acquirerCompanyId] }),
    identifierSource: {
      path: 'params.outletId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['outlet']
    },
    sequelizeFilterScopeParam: {
      validModels: ['outlet']
    }
  })
]

module.exports.getOutletsWithoutAcquirerConfigMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'outlet',
    modelScope: ({ crudCtx }) => ({
      method: [
        'outletWithoutAcquirerConfigOutlet',
        crudCtx.getSecondaryIdentifier({
          path: 'params.acquirerConfigId',
          type: 'int'
        })
      ]
    }),
    identifierSource: {
      path: 'params.outletId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['outlet']
    },
    sequelizeFilterScopeParam: {
      validModels: ['outlet', 'merchant']
    }
  })
]
