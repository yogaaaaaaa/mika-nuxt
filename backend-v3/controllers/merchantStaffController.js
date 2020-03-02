'use strict'

const crudGenerator = require('./helpers/crudGenerator')
const userCrudGenerator = require('./helpers/userCrudGenerator')
const merchantStaffValidator = require('validators/merchantStaffValidator')

module.exports.getMerchantStaffMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'merchantStaff',
    modelScope: 'merchantStaff',
    onlySingleRead: true,
    identifierSource: {
      path: 'auth.merchantStaffId',
      as: 'id'
    }
  })
]

module.exports.createMerchantStaffMiddlewares = [
  merchantStaffValidator.bodyCreate,
  userCrudGenerator.generateCreateUserController({
    modelName: 'merchantStaff',
    modelScopeResponse: 'admin'
  })
]

module.exports.getMerchantStaffsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'merchantStaff',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.merchantStaffId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['merchantStaff']
    },
    sequelizeFilterScopeParam: {
      validModels: ['merchantStaff', 'user']
    }
  })
]

module.exports.updateMerchantStaffMiddlewares = [
  merchantStaffValidator.bodyUpdate,
  userCrudGenerator.generateUpdateUserController({
    modelName: 'merchantStaff',
    modelScopeResponse: 'admin',
    identifierSource: {
      path: 'params.merchantStaffId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.deleteMerchantStaffMiddlewares = [
  userCrudGenerator.generateDeleteUserController({
    modelName: 'merchantStaff',
    identifierSource: {
      path: 'params.merchantStaffId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.resetMerchantStaffPasswordMiddlewares = [
  userCrudGenerator.generateResetUserPasswordController({
    modelName: 'merchantStaff',
    identifierSource: {
      path: 'params.merchantStaffId',
      as: 'id',
      type: 'int'
    }
  })
]
