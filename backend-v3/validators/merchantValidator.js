'use strict'

const { body } = require('express-validator')

const helper = require('./helper')

const idAliasValidator = () => body('idAlias').isLength({ min: 1, max: 25 })
const nameValidator = () => body('name').not().isEmpty()
const emailValidator = () => body('email').isEmail()
const ownerEmailValidator = () => body('ownerEmail').isEmail()

const defaultValidator = [
  helper.archivedAtValidator,
  emailValidator().optional(),
  ownerEmailValidator().optional(),
  helper.bodyRemove('scannedTaxCardResourceId'),
  helper.bodyRemove('scannedBankStatementResourceId'),
  helper.bodyRemove('scannedSkmenkumhamResourceId'),
  helper.bodyRemove('scannedSiupResourceId'),
  helper.bodyRemove('scannedTdpResourceId'),
  helper.bodyRemove('scannedSkdpResourceId'),
  helper.bodyRemove('scannedSkdpResourceId')
]

module.exports.bodyCreate = [
  defaultValidator,
  idAliasValidator().optional(), // TODO: Optional for now
  nameValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  idAliasValidator().optional(),
  nameValidator().optional()
]
