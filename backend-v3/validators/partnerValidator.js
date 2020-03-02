'use strict'

const { body } = require('express-validator')

const helper = require('./helper')

const nameValidator = () => body('name').not().isEmpty()
const emailValidator = () => body('email').isEmail()

const defaultValidator = [
  helper.archivedAtValidator,
  emailValidator().optional()
]

module.exports.bodyCreate = [
  defaultValidator,
  nameValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  nameValidator().optional()
]
