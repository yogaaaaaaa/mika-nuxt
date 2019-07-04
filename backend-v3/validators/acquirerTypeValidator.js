'use strict'

const { body } = require('express-validator')

const helper = require('./helper')

const classValidator = () => body('class').not().isEmpty()
const nameValidator = () => body('name').not().isEmpty()
const chartColorValidator = () => body('chartColor').isHexColor()

const defaultValidator = [
  helper.archivedAtValidator
]

module.exports.bodyCreate = [
  defaultValidator,
  classValidator(),
  nameValidator(),
  chartColorValidator().optional({ nullable: true })
]

module.exports.bodyUpdate = [
  defaultValidator,
  classValidator().optional(),
  nameValidator().optional()
]
