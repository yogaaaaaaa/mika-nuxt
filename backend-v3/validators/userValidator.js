'use strict'

const { body } = require('express-validator')

const helper = require('./helper')

const userUsernameValidator = () =>
  body('user.username')
    .not()
    .isEmpty()

const userPasswordValidator = () =>
  body('user.password')
    .custom(helper.isStandardPassword)

const userRolesValidator = (validUserRoles) =>
  body('user.userRoles').custom((userRoles) => {
    if (Array.isArray(validUserRoles)) {
      if (!Array.isArray(userRoles)) return false
      for (const userRole of userRoles) {
        if (!validUserRoles.includes(userRole)) return false
      }
    }
    return true
  })

const defaultValidator = [
  helper.bodyRemove('user.lastPasswords'),
  // helper.bodyRemove('user.failedLoginAttempt'),
  helper.bodyRemove('user.lastPasswordChangeAt'),
  helper.bodyRemove('user.lastLoginAt'),
  helper.bodyRemove('user.createdAt')
]

module.exports.bodyNestedCreate = (defaultUserType, validUserRoles) => [
  defaultValidator,
  helper.bodyDefault('user.userType', defaultUserType),
  userUsernameValidator(),
  helper.bodyRemove('user.password'),
  userRolesValidator(validUserRoles)
]

module.exports.bodyNestedUpdate = (defaultUserType, validUserRoles) => [
  defaultValidator,
  helper.bodyRemove('user.userType'),
  userUsernameValidator()
    .optional(),
  userPasswordValidator()
    .optional(),
  userRolesValidator(validUserRoles)
    .optional()
]

module.exports.checkPassword = [
  body('password')
    .not()
    .isEmpty()
]
