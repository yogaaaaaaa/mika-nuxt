'use strict'

const { body } = require('express-validator/check')

const userTypesValidation = (validUserTypes) => body('user.userTypes').isIn(validUserTypes)
const userRolesValidation = (validUserRoles) =>
  body('user.userRoles').custom((userRoles) => {
    if (!Array.isArray(userRoles)) return false
    if (!Array.isArray(validUserRoles)) return false
    for (const userRole of userRoles) {
      if (!validUserRoles.includes(userRole)) return false
    }
    return true
  })

module.exports.bodyUserCreate = (validUserTypes, validUserRoles) => [
  body('user.username')
    .isString()
    .not()
    .isEmpty(),
  body('user.password')
    .isString()
    .not()
    .isEmpty(),
  body('user.userTypes').isIn(validUserTypes).optional(),
  userTypesValidation(validUserTypes).optional(),
  userRolesValidation(validUserRoles)
]

module.exports.bodyUserUpdate = (validUserTypes, validUserRoles) => [
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
  userTypesValidation(validUserTypes).optional(),
  userRolesValidation(validUserRoles).optional()
]
