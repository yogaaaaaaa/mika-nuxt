'use strict'

const { body } = require('express-validator')
const helper = require('./helper')

const idValidator = () => body('id').isLength({ min: 1, max: 64 })

const defaultValidator = [
  helper.archivedAtValidator
]

module.exports.bodyCreate = [
  defaultValidator,
  idValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  idValidator().optional()
]
