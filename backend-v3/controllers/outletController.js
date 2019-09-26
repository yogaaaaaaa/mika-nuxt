'use strict'

const msg = require('../libs/msg')
const models = require('../models')

const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const outletValidator = require('../validators/outletValidator')

module.exports.getMerchantStaffOutlets = async (req, res, next) => {
  const query = { where: {} }

  const scopedOutlet = models.outlet.scope({ method: ['merchantStaff', req.auth.merchantStaffId] })

  if (req.params.outletId) query.where.id = req.params.outletId
  if (req.params.idAlias) query.where.idAlias = req.params.idAlias

  if (req.params.outletId || req.params.idAlias) {
    msg.expressGetEntityResponse(
      res,
      await scopedOutlet.findOne(query)
    )
  } else {
    const localScopedOutlet =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedOutlet
        )
      )

    if (req.query.get_count) {
      const outlets = await localScopedOutlet.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        outlets.rows,
        outlets.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await localScopedOutlet.findAll(query)
      )
    }
  }
}

module.exports.getAcquirerStaffOutlets = async (req, res, next) => {
  const query = { where: {} }

  const scopedOutlet = models.outlet.scope({ method: ['acquirerStaff', req.auth.acquirerCompanyId] })

  if (req.params.outletId) {
    query.where.id = req.params.outletId
    msg.expressGetEntityResponse(
      res,
      await scopedOutlet.findOne(query)
    )
  } else {
    const localScopedOutlet =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedOutlet
        )
      )

    if (req.query.get_count) {
      const outlets = await localScopedOutlet.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        outlets.rows,
        outlets.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await localScopedOutlet.findAll(query)
      )
    }
  }
}

module.exports.createOutlet = async (req, res, next) => {
  let outlet
  if (req.params.merchantId) {
    req.body.merchantId = req.params.merchantId
  }

  await models.sequelize.transaction(async t => {
    outlet = await models.outlet.createWithResources(req.body, { transaction: t })
    outlet = await models.outlet.findByPk(outlet.id, { transaction: t })
  })

  msg.expressCreateEntityResponse(
    res,
    outlet
  )
}

module.exports.getOutlets = async (req, res, next) => {
  const query = { where: {} }

  if (req.params.outletId) {
    const scopedOutlet = req.applySequelizeCommonScope(models.outlet.scope('admin'))
    query.where.id = req.params.outletId
    msg.expressGetEntityResponse(
      res,
      await scopedOutlet.findOne(query)
    )
  } else {
    let scopedOutlet = models.outlet.scope({
      method: [
        'admin',
        req.params.merchantStaffId || req.params.excludeMerchantStaffId,
        req.params.excludeMerchantStaffId
      ]
    })
    scopedOutlet =
      req.applySequelizeCommonScope(
        req.applySequelizeFilterScope(
          req.applySequelizePaginationScope(
            scopedOutlet
          )
        )
      )
    if (req.query.get_count) {
      const outlets = await scopedOutlet.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        outlets.rows,
        outlets.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedOutlet.findAll(query)
      )
    }
  }
}

module.exports.updateOutlet = async (req, res, next) => {
  const scopedOutlet = models.outlet.scope('paranoid')
  let outlet

  let updated = false
  let found = false

  await models.sequelize.transaction(async t => {
    outlet = await scopedOutlet.findByPk(req.params.outletId, { transaction: t })
    if (outlet) {
      found = true

      Object.assign(outlet, req.body)

      if (req.body.archivedAt === true || req.body.archivedAt === false) {
        outlet.setDataValue('archivedAt', req.body.archivedAt ? new Date() : null)
      }

      if (outlet.changed()) updated = true
      await outlet.save({ transaction: t })

      if (updated) {
        outlet = await scopedOutlet.findByPk(outlet.id, { transaction: t })
      }
    }
  })

  msg.expressUpdateEntityResponse(
    res,
    updated,
    outlet,
    found
  )
}

module.exports.createOutletMiddlewares = [
  outletValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createOutlet,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.updateOutletMiddlewares = [
  outletValidator.bodyUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.updateOutlet,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.getOutletsMiddlewares = [
  queryToSequelizeMiddleware.commonValidator,
  queryToSequelizeMiddleware.paginationValidator(['outlet']),
  queryToSequelizeMiddleware.filterValidator(['outlet']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  queryToSequelizeMiddleware.common,
  exports.getOutlets
]

module.exports.getMerchantStaffOutletsMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['outlet']),
  queryToSequelizeMiddleware.filterValidator(['outlet']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  module.exports.getMerchantStaffOutlets
]

module.exports.getAcquirerStaffOutletsMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['outlet']),
  queryToSequelizeMiddleware.filterValidator(['outlet']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  module.exports.getAcquirerStaffOutlets
]
