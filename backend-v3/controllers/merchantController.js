'use strict'

const msg = require('../libs/msg')

const { body } = require('express-validator/check')

// const errorMiddleware = require('../middlewares/errorMiddleware')
// const queryMiddleware = require('../middlewares/queryMiddleware')

const models = require('../models')

module.exports.createMerchantValidator = [
  body('idAlias')
    .isString()
    .isLength({ min: 1, max: 40 }),
  body('shortName')
    .isString()
    .isLength({ min: 1, max: 25 }),
  body('name')
    .isString()
    .not()
    .isEmpty()
]

module.exports.createMerchant = async (req, res, next) => {
  let merchant = await models.merchant.create(req.body)
  await models.sequelize.transaction(async t => {
    let merchant = Object.assign({}, {}, req.body)
  })
}
