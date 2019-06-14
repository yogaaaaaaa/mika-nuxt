'use strict'

const { body } = require('express-validator/check')

const defaultValidator = [
  body('*.outletId')
    .not()
    .isEmpty()
]

module.exports.bodyCreate = [
  defaultValidator
]

module.exports.bodyDelete = [
  defaultValidator
]
