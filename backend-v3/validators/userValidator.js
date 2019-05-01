'use strict'

const auth = require('../helpers/auth')
const { body } = require('express-validator/check')

module.exports.bodyUser = [
  body('user.username')
    .isString()
    .not()
    .isEmpty(),
  body('user.password')
    .isString()
    .not()
    .isEmpty(),
  body('user.userRoles').isIn(Object.keys(auth.userRoles).map(key => auth.userRoles[key])),
  body('user.userTypes').isIn(Object.keys(auth.userTypes).map(key => auth.userTypes[key]))
]

module.exports.bodyUserOptional = [
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
  body('user.userRoles')
    .isIn(Object.keys(auth.userRoles).map(key => auth.userRoles[key]))
    .optional(),
  body('user.userTypes')
    .isIn(Object.keys(auth.userTypes).map(key => auth.userTypes[key]))
    .optional()
]
