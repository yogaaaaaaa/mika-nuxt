'use strict'

const { body } = require('express-validator')

const auth = require('../libs/auth')

const helper = require('./helper')
const userValidator = require('./userValidator')

const nameValidator = () => body('name').not().isEmpty()
const emailValidator = () => body('email').isEmail()
const locationLongValidator = () => body('locationLong').isNumeric()
const locationLatValidator = () => body('locationLat').isNumeric()

const merchantIdValidator = () => body('merchantId').not().isEmpty()

const defaultValidator = [
  helper.bodyRemove('userId'),
  helper.archivedAtValidator,
  locationLatValidator().optional({ nullable: true }),
  locationLongValidator().optional({ nullable: true })
]

module.exports.bodyCreate = [
  defaultValidator,
  nameValidator(),
  emailValidator(),
  merchantIdValidator(),
  userValidator.bodyNestedCreate(auth.userTypes.MERCHANT_STAFF)
]

module.exports.bodyUpdate = [
  defaultValidator,
  nameValidator().optional(),
  emailValidator().optional(),
  merchantIdValidator().optional(),
  userValidator.bodyNestedUpdate(auth.userTypes.MERCHANT_STAFF)
]
