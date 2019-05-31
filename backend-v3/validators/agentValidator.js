'use strict'

const { body } = require('express-validator/check')

const auth = require('../libs/auth')

const helper = require('./helper')
const userValidator = require('./userValidator')

const nameValidator = body('name').not().isEmpty()
const generalLocationLongValidator = body('generalLocationLong').isNumeric()
const generalLocationLatValidator = body('generalLocationLat').isNumeric()
const generalLocationRadiusMeterValidator = body('generalLocationRadiusMeter').isNumeric()

const outletIdValidator = body('outletId').not().isEmpty()

const defaultValidator = [
  helper.bodyRemove('userId'),
  helper.archivedAtValidator,
  generalLocationLatValidator.optional(),
  generalLocationLongValidator.optional(),
  generalLocationRadiusMeterValidator.optional()
]

module.exports.bodyCreate = [
  defaultValidator,
  nameValidator,
  outletIdValidator,
  userValidator.bodyNestedCreate(auth.userTypes.AGENT)
]

module.exports.bodyUpdate = [
  defaultValidator,
  nameValidator.optional(),
  outletIdValidator.optional(),
  userValidator.bodyNestedUpdate(auth.userTypes.AGENT)
]
