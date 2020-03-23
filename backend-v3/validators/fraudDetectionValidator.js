'use strict'

const helper = require('./helper')
const { body } = require('express-validator')

const commonValidator = [
  body('recency.masked_pan.high').isNumeric().optional(),
  body('recency.masked_pan.low').isNumeric().optional(),
  body('recency.msisdn.high').isNumeric().optional(),
  body('recency.msisdn.low').isNumeric().optional(),

  body('frequency').isArray().optional().withMessage(
    'frequency should be an array'
  ),
  body('frequency.*.range').isIn(['day', 'month', 'year']).withMessage(
    'range should be in, day, month or year'
  ),
  body('frequency.*.masked_pan.high').isNumeric().optional(),
  body('frequency.*.masked_pan.low').isNumeric().optional(),
  body('frequency.*.msisdn.high').isNumeric().optional(),
  body('frequency.*.msisdn.low').isNumeric().optional(),
  body('frequency.*.id_outlet.high').isNumeric().optional(),
  body('frequency.*.id_outlet.high').isNumeric().optional(),
  body('frequency.*.id_agent.low').isNumeric().optional(),
  body('frequency.*.id_agent.low').isNumeric().optional(),
  body('frequency.*.id_merchant.low').isNumeric().optional(),
  body('frequency.*.id_merchant.low').isNumeric().optional(),

  body('monetary').isArray().optional().withMessage(
    'monetary should be an array'
  ),
  body('monetary.*.range').isIn(['day', 'month', 'year']).withMessage(
    'range should be in, day, month or year'
  ),
  body('monetary.*.masked_pan_average.high').isNumeric().optional(),
  body('monetary.*.masked_pan_average.low').isNumeric().optional(),
  body('monetary.*.msisdn_average.high').isNumeric().optional(),
  body('monetary.*.msisdn_average.low').isNumeric().optional(),
  body('monetary.*.id_outlet_average.high').isNumeric().optional(),
  body('monetary.*.id_outlet_average.high').isNumeric().optional(),
  body('monetary.*.id_agent_average.low').isNumeric().optional(),
  body('monetary.*.id_agent_average.low').isNumeric().optional(),
  body('monetary.*.id_merchant_average.low').isNumeric().optional(),
  body('monetary.*.id_merchant_average.low').isNumeric().optional(),

  body('velocity').isArray().optional().withMessage(
    'velocity should be an array'
  ),
  body('velocity.*.range').isIn(['day', 'month', 'year']).withMessage(
    'range should be in, day, month or year'
  ),
  body('velocity.*.masked_pan.high').isNumeric().optional(),
  body('velocity.*.masked_pan.low').isNumeric().optional(),
  body('velocity.*.msisdn.high').isNumeric().optional(),
  body('velocity.*.msisdn.low').isNumeric().optional(),
  body('velocity.*.id_outlet.high').isNumeric().optional(),
  body('velocity.*.id_outlet.high').isNumeric().optional(),
  body('velocity.*.id_agent.low').isNumeric().optional(),
  body('velocity.*.id_agent.low').isNumeric().optional(),
  body('velocity.*.id_merchant.low').isNumeric().optional(),
  body('velocity.*.id_merchant.low').isNumeric().optional()
]

module.exports.bodyMerchantRuleCreate = [
  commonValidator,
  body('id_merchant').isNumeric().not().isEmpty()
]

module.exports.bodyMerchantRuleUpdate = [
  commonValidator,
  helper.bodyRemove('id_merchant')
]
