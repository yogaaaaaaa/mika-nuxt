'use strict'

const { body } = require('express-validator')

const auth = require('../libs/auth')

const helper = require('./helper')
const userValidator = require('./userValidator')

const nameValidator = () =>
  body('name')
    .escape()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(
      'Name should be String, more than 2 characters and less than 50 characters'
    )
const emailValidator = () => body('email').isEmail()

const descriptionValidator = () =>
  body('description')
    .escape()
    .trim()
    .isLength({ min: 0, max: 250 })
    .optional()

const acquirerCompanyIdValidator = () =>
  body('acquirerCompanyId')
    .not()
    .isEmpty()

const defaultValidator = [
  helper.bodyRemove('userId'),
  helper.archivedAtValidator
]

module.exports.bodyCreate = [
  defaultValidator,
  nameValidator(),
  emailValidator(),
  descriptionValidator(),
  acquirerCompanyIdValidator(),
  userValidator.bodyNestedCreate(auth.userTypes.ACQUIRER_STAFF)
]

module.exports.bodyUpdate = [
  defaultValidator,
  nameValidator().optional(),
  emailValidator().optional(),
  descriptionValidator(),
  acquirerCompanyIdValidator().optional(),
  userValidator.bodyNestedUpdate(auth.userTypes.ACQUIRER_STAFF)
]
