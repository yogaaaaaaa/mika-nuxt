'use strict'

const { body } = require('express-validator')

const helper = require('./helper')

const nameValidator = () => body('name').not().isEmpty()

const defaultValidator = [
  helper.archivedAtValidator
]

module.exports.bodyCreate = [
  defaultValidator,
  nameValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  nameValidator().optional()
]
