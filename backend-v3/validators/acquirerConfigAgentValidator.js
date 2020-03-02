'use strict'

const _ = require('lodash')
const { body } = require('express-validator')

const helper = require('./helper')

const configValidator = () => body('config').custom((config) => _.isPlainObject(config))
const acquirerConfigIdValidator = () => body('acquirerConfigId').isInt()
const agentIdValidator = () => body('agentId').isInt()
const acquirerTerminalIdValidator = () => body('agentId').isInt()

const defaultValidator = [
  helper.archivedAtValidator,
  configValidator().optional()
]

module.exports.bodyCreate = [
  defaultValidator,
  acquirerConfigIdValidator(),
  agentIdValidator(),
  acquirerTerminalIdValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  acquirerConfigIdValidator().optional(),
  agentIdValidator().optional(),
  acquirerTerminalIdValidator().optional()
]
