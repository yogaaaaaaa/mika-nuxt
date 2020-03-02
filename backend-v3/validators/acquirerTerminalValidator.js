'use strict'

const _ = require('lodash')
const { body } = require('express-validator')

const helper = require('./helper')

const acquireTerminalCommonIdValidator = () => body('acquirerTerminalCommonId').isInt()
const configValidator = () => body('config').custom((config) => _.isPlainObject(config))

const defaultValidator = [
  helper.archivedAtValidator,
  configValidator().optional()
]

module.exports.bodyCreate = [
  defaultValidator,
  acquireTerminalCommonIdValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  acquireTerminalCommonIdValidator().optional()
]
