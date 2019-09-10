'use strict'

const msg = require('../libs/msg')
const models = require('../models')

const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const merchantValidator = require('../validators/merchantValidator')

module.exports.createMerchant = async (req, res, next) => {
  let merchant
  await models.sequelize.transaction(async t => {
    merchant = await models.merchant.createWithResources(req.body, { transaction: t })
    merchant = await models.merchant.findByPk(merchant.id, { transaction: t })
  })

  msg.expressCreateEntityResponse(
    res,
    merchant
  )
}

module.exports.getMerchants = async (req, res, next) => {
  let scopedMerchant = req.applySequelizeCommonScope(models.merchant.scope('admin'))
  let query = { where: {} }

  if (req.params.merchantId) {
    query.where.id = req.params.merchantId
    msg.expressGetEntityResponse(
      res,
      await scopedMerchant.findOne(query)
    )
  } else {
    scopedMerchant =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedMerchant
        )
      )
    if (req.query.get_count) {
      let merchants = await scopedMerchant.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        merchants.rows,
        merchants.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedMerchant.findAll(query)
      )
    }
  }
}

module.exports.updateMerchant = async (req, res, next) => {
  let scopedMerchant = models.merchant.scope('paranoid')
  let merchant

  let updated = false
  let found = false

  await models.sequelize.transaction(async t => {
    merchant = await scopedMerchant.findByPk(req.params.merchantId, { transaction: t })
    if (merchant) {
      found = true

      Object.assign(merchant, req.body)

      if (req.body.archivedAt === true || req.body.archivedAt === false) {
        merchant.setDataValue('archivedAt', req.body.archivedAt ? new Date() : null)
      }

      if (merchant.changed()) updated = true
      await merchant.save({ transaction: t })
    }

    if (updated) {
      merchant = await scopedMerchant.findByPk(merchant.id, { transaction: t })
    }
  })

  msg.expressUpdateEntityResponse(
    res,
    updated,
    merchant,
    found
  )
}

module.exports.createMerchantMiddlewares = [
  merchantValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createMerchant,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.updateMerchantMiddlewares = [
  merchantValidator.bodyUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.updateMerchant,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.getMerchantsMiddlewares = [
  queryToSequelizeMiddleware.commonValidator,
  queryToSequelizeMiddleware.paginationValidator(['merchant']),
  queryToSequelizeMiddleware.filterValidator(['merchant', 'partner']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  queryToSequelizeMiddleware.common,
  exports.getMerchants
]
