'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const userCrudGenerator = require('./helpers/userCrudGenerator')
const agentValidator = require('validators/agentValidator')

module.exports.getAgentMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'agent',
    modelScope: 'agent',
    onlySingleRead: true,
    identifierSource: {
      path: 'auth.agentId',
      as: 'id'
    }
  })
]

module.exports.createAgentMiddlewares = [
  agentValidator.bodyCreate,
  userCrudGenerator.generateCreateUserController({
    modelName: 'agent',
    modelScopeResponse: 'admin'
  })
]

module.exports.getAgentsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'agent',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.agentId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['agent']
    },
    sequelizeFilterScopeParam: {
      validModels: ['agent', 'outlet', 'user']
    }
  })
]

module.exports.updateAgentMiddlewares = [
  agentValidator.bodyUpdate,
  userCrudGenerator.generateUpdateUserController({
    modelName: 'agent',
    modelScopeResponse: 'admin',
    identifierSource: {
      path: 'params.agentId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.deleteAgentMiddlewares = [
  userCrudGenerator.generateDeleteUserController({
    modelName: 'agent',
    identifierSource: {
      path: 'params.agentId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.resetAgentPasswordMiddlewares = [
  userCrudGenerator.generateResetUserPasswordController({
    modelName: 'agent',
    identifierSource: {
      path: 'params.agentId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.getMerchantStaffAgentsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'agent',
    modelScope: ({ req }) => (
      { method: ['merchantStaff', req.auth.merchantStaffId] }
    ),
    identifierSource: [
      {
        path: 'params.agentId',
        as: 'id',
        type: 'int'
      },
      {
        path: 'params.outletId',
        as: 'outletId',
        type: 'int'
      }
    ],
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['agent']
    },
    sequelizeFilterScopeParam: {
      validModels: ['agent', 'outlet']
    }
  })
]

module.exports.getAcquirerStaffAgentsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'agent',
    modelScope: ({ req }) => ({ method: ['acquirerStaff', req.auth.acquirerCompanyId] }),
    identifierSource: {
      path: 'params.agentId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['agent']
    },
    sequelizeFilterScopeParam: {
      validModels: ['agent', 'outlet']
    }
  })
]

module.exports.getAgentsWithoutAcquirerConfigMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'agent',
    modelScope: ({ crudCtx }) => ({
      method: [
        'agentWithoutAcquirerConfigAgent',
        crudCtx.getSecondaryIdentifier({
          path: 'params.acquirerConfigId',
          type: 'int'
        })
      ]
    }),
    identifierSource: {
      path: 'params.agentId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['agent']
    },
    sequelizeFilterScopeParam: {
      validModels: ['agent', 'outlet', 'merchant']
    }
  })
]
