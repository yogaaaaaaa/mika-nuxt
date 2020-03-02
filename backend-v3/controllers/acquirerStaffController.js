'use strict'

const userCrudGenerator = require('./helpers/userCrudGenerator')
const crudGenerator = require('./helpers/crudGenerator')
const acquirerStaffValidator = require('validators/acquirerStaffValidator')

module.exports.getAcquirerStaffMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'acquirerStaff',
    modelScope: 'acquirerStaff',
    onlySingleRead: true,
    identifierSource: {
      path: 'auth.acquirerStaffId',
      as: 'id'
    }
  })
]

module.exports.createAcquirerStaffMiddlewares = [
  acquirerStaffValidator.bodyCreate,
  userCrudGenerator.generateCreateUserController({
    modelName: 'acquirerStaff',
    modelScopeResponse: 'admin'
  })
]

module.exports.getAcquirerStaffsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'acquirerStaff',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerStaffId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['acquirerStaff']
    },
    sequelizeFilterScopeParam: {
      validModels: ['acquirerStaff', 'user']
    }
  })
]

module.exports.updateAcquirerStaffMiddlewares = [
  acquirerStaffValidator.bodyUpdate,
  userCrudGenerator.generateUpdateUserController({
    modelName: 'acquirerStaff',
    modelScopeResponse: 'admin',
    identifierSource: {
      path: 'params.acquirerStaffId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.deleteAcquirerStaffMiddlewares = [
  userCrudGenerator.generateDeleteUserController({
    modelName: 'acquirerStaff',
    identifierSource: {
      path: 'params.acquirerStaffId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.resetAcquirerStaffPasswordMiddlewares = [
  userCrudGenerator.generateResetUserPasswordController({
    modelName: 'acquirerStaff',
    identifierSource: {
      path: 'params.acquirerStaffId',
      as: 'id',
      type: 'int'
    }
  })
]
