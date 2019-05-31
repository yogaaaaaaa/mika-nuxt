'use strict'

const { body } = require('express-validator/check')

const helper = require('./helper')

const merchantIdValidator = body('merchantId').not().isEmpty()
const acquirerTypeIdValidator = body('acquirerTypeId').not().isEmpty()

const defaultValidator = [
  helper.archivedAtValidator
]

module.exports.bodyCreate = [
  defaultValidator,
  merchantIdValidator,
  acquirerTypeIdValidator
]

module.exports.bodyUpdate = [
  defaultValidator,
  merchantIdValidator.optional(),
  acquirerTypeIdValidator.optional()
]
