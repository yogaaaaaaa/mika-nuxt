'use strict'

const { body } = require('express-validator')

const helper = require('./helper')

const idAliasValidator = () => body('idAlias').isLength({ min: 1, max: 25 })
const nameValidator = () => body('name').not().isEmpty()
const emailValidator = () => body('email').isEmail()
const locationLongValidator = () => body('locationLong').isNumeric()
const locationLatValidator = () => body('locationLat').isNumeric()

const merchantIdValidator = () => body('merchantId').not().isEmpty()

const defaultValidator = [
  helper.archivedAtValidator,
  emailValidator().optional(),
  locationLongValidator().optional(),
  locationLatValidator().optional(),
  helper.bodyRemove('outletPhotoResourceId'),
  helper.bodyRemove('cashierDeskPhotoResourceId')
]

module.exports.bodyCreate = [
  defaultValidator,
  idAliasValidator().optional(), // TODO: Optional for now
  nameValidator(),
  merchantIdValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  idAliasValidator().optional(),
  nameValidator().optional(),
  merchantIdValidator().optional()
]
