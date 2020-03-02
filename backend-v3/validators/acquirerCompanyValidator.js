'use strict'

const { body } = require('express-validator')

const helper = require('./helper')

const nameValidator = () =>
  body('name')
    .isString()
    .escape()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(
      'Name should be String, more than 2 characters and less than 50 characters'
    )

const descriptionValidator = () =>
  body('description')
    .isString()
    .escape()
    .trim()
    .isLength({ min: 0, max: 250 })
    .optional()

const defaultValidator = [
  helper.archivedAtValidator
]

module.exports.bodyCreate = [
  defaultValidator,
  nameValidator(),
  descriptionValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  nameValidator().optional(),
  descriptionValidator().optional()
]
