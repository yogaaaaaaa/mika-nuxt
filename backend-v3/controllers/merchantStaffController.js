'use strict'

const msg = require('../helpers/msg')

// const { body } = require('express-validator/check')

// const errorMiddleware = require('../middlewares/errorMiddleware')
// const queryMiddleware = require('../middlewares/queryMiddleware')

const models = require('../models')
// const Sequelize = models.Sequelize

/**
 * Get self merchant staff
 */
module.exports.getMerchantStaff = (req, res, next) => {
  let merchantStaff = models.merchantStaff
    .scope('merchantStaff')
    .findByPk(req.auth.merchantStaffId)

  if (!merchantStaff) throw Error('MerchantStaff should be exist')

  msg.expressCreateEntityResponse(
    res,
    merchantStaff
  )
}
