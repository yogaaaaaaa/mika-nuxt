'use strict'

const _ = require('lodash')
const { body } = require('express-validator')

const helper = require('./helper')

const configValidator = () => body('config').custom((config) => _.isPlainObject(config))
const acquirerConfigIdValidator = () => body('acquirerConfigId').isInt()
const outletIdValidator = () => body('outletId').isInt()

const defaultValidator = [
  helper.archivedAtValidator,
  configValidator().optional()
]

module.exports.bodyCreate = [
  defaultValidator,
  acquirerConfigIdValidator(),
  outletIdValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  acquirerConfigIdValidator().optional(),
  outletIdValidator().optional()
]
