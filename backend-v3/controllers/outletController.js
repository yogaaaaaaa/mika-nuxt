'use strict'

const msg = require('../libs/msg')
// const trxManager = require('../libs/trxManager')

// const { body } = require('express-validator/check')

const errorMiddleware = require('../middlewares/errorMiddleware')
const queryMiddleware = require('../middlewares/queryMiddleware')

const models = require('../models')
// const Sequelize = models.Sequelize

module.exports.getMerchantStaffOutlets = async (req, res, next) => {
  let query = { where: {} }

  if (req.params.outletId) query.where.id = req.params.outletId
  if (req.params.idAlias) query.where.idAlias = req.params.idAlias

  if (req.params.outletId || req.params.idAlias) {
    msg.expressGetEntityResponse(
      res,
      await models.outlet
        .scope({ method: ['merchantStaff', req.auth.merchantStaffId] })
        .findOne(query)
    )
  } else {
    let scopedOutlet =
      req.applySequelizeFiltersScope(
        req.applySequelizePaginationScope(
          models.outlet.scope({ method: ['merchantStaff', req.auth.merchantStaffId] })
        )
      )

    if (req.query.get_count) {
      let outlets = await scopedOutlet.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        outlets.rows,
        outlets.count,
        req
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedOutlet.findAll(query)
      )
    }
  }
}

/**
 * All Middlewares for getMerchantStaffOutlets
 */
module.exports.getMerchantStaffOutletsMiddlewares = [
  queryMiddleware.paginationToSequelizeValidator(['outlet']),
  queryMiddleware.filtersToSequelizeValidator(['outlet']),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  module.exports.getMerchantStaffOutlets
]
