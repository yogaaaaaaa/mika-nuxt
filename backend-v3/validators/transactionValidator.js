'use strict'

const _ = require('lodash')
const { body } = require('express-validator')

const trxManager = require('../libs/trxManager')

const amountPositiveIntegerValidator = (value) => {
  value = parseFloat(value)
  if (Number.isInteger(value)) {
    if (value > 0 && value <= Number.MAX_SAFE_INTEGER) return true
  }
  return false
}

module.exports.createTransactionValidator = [
  body('amount').custom(amountPositiveIntegerValidator),
  body('acquirerId').exists(),
  body('userToken').optional(),
  body('userTokenType').isString().optional(),
  body('locationLong').isNumeric().optional({ nullable: true }),
  body('locationLat').isNumeric().optional({ nullable: true }),
  body('flags').isArray().optional()
]

module.exports.refundTransactionValidator = [
  body('amount').custom(amountPositiveIntegerValidator).optional({ nullable: true }),
  body('reason').isString().optional({ nullable: true })
]

module.exports.changeAgentTransactionStatusValidator = [
  body('transactionId').exists(),
  body('status').isIn(_.values(trxManager.transactionStatuses)),
  body('syncWithAcquirerHost').isBoolean().optional()
]
