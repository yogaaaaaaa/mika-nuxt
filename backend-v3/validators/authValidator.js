'use strict'

const { body } = require('express-validator')

const helper = require('./helper')

const passwordValidator = (field = 'password') =>
  body(field)
    .custom(helper.isStandardPassword)

module.exports.loginValidator = [
  body('username')
    .isString(),
  body('password')
    .isString(),
  body('userTypes')
    .isArray()
    .optional()
]

module.exports.sessionTokenCheckValidator = [
  body('sessionToken')
    .isString()
]

module.exports.changePasswordValidator = [
  body('oldPassword')
    .isString(),
  passwordValidator()
]

module.exports.changeExpiredPasswordValidator = [
  body('username')
    .isString(),
  body('oldPassword')
    .isString(),
  passwordValidator()
]
