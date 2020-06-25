'use strict'

const _ = require('lodash')

const { body } = require('express-validator')

const helper = require('./helper')
const { acquirerHandlerNames } = require('libs/trxManager')

const nameValidator = () => body('name').not().isEmpty()
const configValidator = () => body('config').custom((config) => _.isPlainObject(config))
const merchantIdValidator = () => body('merchantId').isInt()
const handlerValidator = () => body('handler').isIn(Object.values(acquirerHandlerNames)).not().isEmpty()

const defaultValidator = [
  helper.archivedAtValidator,
  configValidator().optional(),
  merchantIdValidator().optional({ nullable: true }),
  handlerValidator().optional()
]

module.exports.bodyCreate = [
  defaultValidator,
  nameValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  nameValidator().optional()
]
