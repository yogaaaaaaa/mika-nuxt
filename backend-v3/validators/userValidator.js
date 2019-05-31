'use strict'

const { body } = require('express-validator/check')

const helper = require('./helper')

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

module.exports.bodyNestedCreate = (defaultUserType, validUserRoles) => [
  body('user.username')
    .isString()
    .not()
    .isEmpty(),
  body('user.password')
    .isString()
    .not()
    .isEmpty(),
  helper.bodyDefault('user.userType', defaultUserType),
  userRolesValidator(validUserRoles)
]

module.exports.bodyNestedUpdate = (defaultUserType, validUserRoles) => [
  body('user.username')
    .isString()
    .not()
    .isEmpty()
    .optional(),
  body('user.password')
    .isString()
    .not()
    .isEmpty()
    .optional(),
  helper.bodyDefaultExist('user.userType', defaultUserType),
  userRolesValidator(validUserRoles).optional()
]
