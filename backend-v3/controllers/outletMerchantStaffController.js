'use strict'

const msg = require('../libs/msg')
const models = require('../models')

const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

module.exports.addOutletMerchantStaff = async (req, res, next) => {
  await models.sequelize.transaction(async t => {
    if (Array.isArray(req.body)) {
      await models.merchantStaffOutlet.create({
        merchantStaffId: req.params.merchantStaffId
      })
    }
  })
}

module.exports.deleteMerchantStaffOutlet = async (req, res, next) => {
}

module.exports.getAcquirerTypes = async (req, res, next) => {
  let scopedAcquirerType = req.applySequelizeCommonScope(models.acquirerType.scope())
  let query = { where: {} }

  if (req.params.acquirerTypeId) {
    query.where.id = req.params.acquirerTypeId
    msg.expressGetEntityResponse(
      res,
      await scopedAcquirerType.findOne(query)
    )
  } else {
    scopedAcquirerType =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedAcquirerType
        )
      )
    if (req.query.get_count) {
      let acquirerTypes = await scopedAcquirerType.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        acquirerTypes.rows,
        acquirerTypes.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedAcquirerType.findAll(query)
      )
    }
  }
}

module.exports.createAcquirerTypeMiddlewares = [
  acquirerTypeValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createAcquirerType,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.getAcquirerTypesMiddlewares = [
  queryToSequelizeMiddleware.commonValidator,
  queryToSequelizeMiddleware.paginationValidator(['acquirerType']),
  queryToSequelizeMiddleware.filterValidator(['acquirerType']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  queryToSequelizeMiddleware.common,
  exports.getAcquirerTypes
]

module.exports.deleteAcquirerTypeMiddlewares = [
  exports.deleteAcquirerType,
  errorMiddleware.sequelizeErrorHandler
]
