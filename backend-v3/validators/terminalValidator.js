'use strict'

const { body } = require('express-validator')

const helper = require('./helper')

const idAliasValidator = () => body('idAlias').isLength({ min: 1, max: 25 })
const nameValidator = () => body('name').not().isEmpty()

const terminalModelIdValidator = () => body('terminalModelId').isInt()

const defaultValidator = [
  helper.archivedAtValidator
]

module.exports.bodyCreate = [
  defaultValidator,
  idAliasValidator().optional(), // TODO: Optional for now
  nameValidator(),
  terminalModelIdValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  idAliasValidator().optional(),
  nameValidator().optional(),
  terminalModelIdValidator().optional()
]
