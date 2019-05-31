'use strict'

const _ = require('lodash')
const { body } = require('express-validator/check')

const auth = require('../libs/auth')

const userValidator = require('../validators/userValidator')
const helper = require('./helper')

const nameValidator = body('name').not().isEmpty()
const emailValidator = body('email').isEmail()

const defaultValidator = [
  helper.bodyRemove('userId'),
  helper.archivedAtValidator
]

module.exports.bodyCreate = [
  defaultValidator,
  nameValidator,
  emailValidator.optional(),
  userValidator.bodyNestedCreate(auth.userTypes.ADMIN, _.values(auth.userRoles))
]

module.exports.bodyUpdate = [
  defaultValidator,
  nameValidator.optional(),
  emailValidator.optional(),
  userValidator.bodyNestedUpdate(auth.userTypes.ADMIN, _.values(auth.userRoles))
]
