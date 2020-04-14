'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const acquirerConfigValidator = require('validators/acquirerConfigValidator')
const { generateDanaAcquirerConfig } = require('libs/aqDana')
const { paymentClasses } = require('libs/trxManager/constants')

module.exports.createAcquirerConfigMiddlewares = [
  acquirerConfigValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'acquirerConfig',

    createHandler: async ({ crudCtx, res }) => {
      crudCtx.modelInstance = crudCtx.modelScoped.build(crudCtx.data)
      if (crudCtx.data.handler === paymentClasses.DANA) {
        crudCtx.modelInstance.config = await generateDanaAcquirerConfig({ crudCtx, res })
      }
      if (crudCtx.modelInstance) {
        await crudCtx.modelInstance.save(crudCtx.modelOptions)
      }
    }

  })
]

module.exports.updateAcquirerConfigMiddlewares = [
  acquirerConfigValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'acquirerConfig',
    identifierSource: {
      path: 'params.acquirerConfigId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.getAcquirerConfigsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'acquirerConfig',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerConfigId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['acquirerConfig']
    },
    sequelizeFilterScopeParam: {
      validModels: ['acquirerConfig']
    }
  })
]

module.exports.deleteAcquirerConfigMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'acquirerConfig',
    identifierSource: {
      path: 'params.acquirerConfigId',
      as: 'id',
      type: 'int'
    }
  })
]
