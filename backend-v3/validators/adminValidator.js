'use strict'

const _ = require('lodash')
const { body } = require('express-validator')

const auth = require('../libs/auth')

const userValidator = require('validators/userValidator')
const helper = require('./helper')

const nameValidator = () => body('name').not().isEmpty()
const emailValidator = () => body('email').isEmail()

const defaultValidator = [
  helper.bodyRemove('userId'),
  emailValidator().optional(),
  helper.archivedAtValidator
]

module.exports.bodyCreate = [
  defaultValidator,
  nameValidator(),
  userValidator.bodyNestedCreate(auth.userTypes.ADMIN, _.values(auth.userRoles))
]

module.exports.bodyUpdate = [
  defaultValidator,
  nameValidator().optional(),
  userValidator.bodyNestedUpdate(auth.userTypes.ADMIN, _.values(auth.userRoles))
]
