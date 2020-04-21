'use strict'

const _ = require('lodash')

const { body } = require('express-validator')

const helper = require('./helper')
const acquirerHandlers = Array.from(require('../libs/trxManager').acquirerHandlers.keys())

const nameValidator = () => body('name').not().isEmpty()
const configValidator = () => body('config').custom((config) => _.isPlainObject(config))
const merchantIdValidator = () => body('merchantId').isInt()
const handlerValidator = () => body('handler').isIn(Object.values(acquirerHandlers)).not().isEmpty()

const defaultValidator = [
  helper.archivedAtValidator,
  configValidator().optional(),
  merchantIdValidator().optional({ nullable: true }),
  handlerValidator().optional()
]

module.exports.bodyCreate = [
  defaultValidator,
  handlerValidator(),
  nameValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  handlerValidator().optional(),
  nameValidator().optional()
]
