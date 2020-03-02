'use strict'

const { body } = require('express-validator')
const helper = require('./helper')
const models = require('models')

const patternValidator = () => body('pattern').custom(async (value) => {
  if (!value) return false
  try {
    await models.sequelize.query(
      models.query.get('validateRegex.sql', [models.sequelize.escape(value)])
    )
  } catch (error) {
    return false
  }
  return true
})
const priorityValidator = () => body('priority').isInt()
const cardIssuerIdValidator = () => body('cardIssuerId').not().isEmpty()
const cardTypeIdValidator = () => body('cardTypeId').not().isEmpty()
const cardSchemeIdValidator = () => body('cardSchemeId').not().isEmpty()

const defaultValidator = [
  helper.archivedAtValidator
]

module.exports.bodyCreate = [
  defaultValidator,
  patternValidator(),
  priorityValidator(),
  cardTypeIdValidator(),
  cardSchemeIdValidator(),
  cardIssuerIdValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  patternValidator().optional(),
  priorityValidator().optional(),
  cardTypeIdValidator().optional(),
  cardSchemeIdValidator().optional(),
  cardIssuerIdValidator().optional()
]
