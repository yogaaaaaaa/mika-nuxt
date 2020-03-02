'use strict'

const _ = require('lodash')
const { body } = require('express-validator')

const helper = require('./helper')

const configValidator = () => body('config').custom((config) => _.isPlainObject(config))
const acquirerCompanyIdValidator = () => body('acquirerCompanyId').isInt()

const defaultValidator = [
  helper.archivedAtValidator,
  configValidator().optional()
]

module.exports.bodyCreate = [
  defaultValidator,
  acquirerCompanyIdValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  acquirerCompanyIdValidator().optional()
]
