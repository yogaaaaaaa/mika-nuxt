'use strict'

const userCrudGenerator = require('./helpers/userCrudGenerator')
const crudGenerator = require('./helpers/crudGenerator')
const adminValidator = require('validators/adminValidator')

module.exports.getAdminMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'admin',
    modelScope: 'admin',
    onlySingleRead: true,
    identifierSource: {
      path: 'auth.adminId',
      as: 'id'
    }
  })
]

module.exports.createAdminMiddlewares = [
  adminValidator.bodyCreate,
  userCrudGenerator.generateCreateUserController({
    modelName: 'admin',
    modelScope: 'admin'
  })
]

module.exports.getAdminsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'admin',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.adminId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['admin']
    },
    sequelizeFilterScopeParam: {
      validModels: ['admin', 'user']
    }
  })
]

module.exports.updateAdminMiddlewares = [
  adminValidator.bodyUpdate,
  userCrudGenerator.generateUpdateUserController({
    modelName: 'admin',
    modelScopeResponse: 'admin',
    identifierSource: {
      path: 'params.adminId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.deleteAdminMiddlewares = [
  userCrudGenerator.generateDeleteUserController({
    modelName: 'admin',
    identifierSource: {
      path: 'params.admin',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.resetAdminPasswordMiddlewares = [
  userCrudGenerator.generateResetUserPasswordController({
    modelName: 'admin',
    identifierSource: {
      path: 'params.adminId',
      as: 'id',
      type: 'int'
    }
  })
]
