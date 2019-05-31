'use strict'

const { body } = require('express-validator/check')

const helper = require('./helper')

const classValidator = body('class').not().isEmpty()
const nameValidator = body('name').not().isEmpty()

const defaultValidator = [
  helper.archivedAtValidator
]

module.exports.bodyCreate = [
  defaultValidator,
  classValidator,
  nameValidator
]

module.exports.bodyUpdate = [
  defaultValidator,
  classValidator.optional(),
  nameValidator.optional()
]
