'use strict'

const msg = require('../libs/msg')
const auth = require('../libs/auth')
const models = require('../models')

const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const merchantStaffValidator = require('../validators/merchantStaffValidator')

module.exports.getMerchantStaff = async (req, res, next) => {
  let merchantStaff = await models.merchantStaff
    .scope('merchantStaff')
    .findByPk(req.auth.merchantStaffId)

  if (!merchantStaff) throw Error('merchantStaff should be exist')

  msg.expressGetEntityResponse(
    res,
    merchantStaff
  )
}

module.exports.createMerchantStaff = async (req, res, next) => {
  let merchantStaff

  await models.sequelize.transaction(async t => {
    merchantStaff = await models.merchantStaff.create(req.body, {
      include: [ models.user ],
      transaction: t
    })
    merchantStaff = await models.merchantStaff
      .scope('admin')
      .findByPk(merchantStaff.id, { transaction: t })
  })

  msg.expressCreateEntityResponse(
    res,
    merchantStaff
  )
}

module.exports.getMerchantStaffs = async (req, res, next) => {
  let scopedMerchantStaff = req.applySequelizeCommonScope(models.merchantStaff.scope('admin'))
  let query = { where: {} }

  if (req.params.merchantStaffId) {
    query.where.id = req.params.merchantStaffId
    msg.expressGetEntityResponse(
      res,
      await scopedMerchantStaff.findOne(query)
    )
  } else {
    scopedMerchantStaff =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedMerchantStaff
        )
      )
    if (req.query.get_count) {
      let merchantStaffs = await scopedMerchantStaff.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        merchantStaffs.rows,
        merchantStaffs.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedMerchantStaff.findAll(query)
      )
    }
  }
}

module.exports.updateMerchantStaff = async (req, res, next) => {
  let scopedMerchantStaff = models.merchantStaff.scope('admin', 'paranoid')
  let merchantStaff

  let updated = false
  let found = false

  await models.sequelize.transaction(async t => {
    merchantStaff = await scopedMerchantStaff.findByPk(req.params.merchantStaffId, { transaction: t })
    if (merchantStaff) {
      found = true

      if (req.body.user) {
        Object.assign(merchantStaff.user, req.body.user)
        delete req.body.user

        if (merchantStaff.user.changed()) updated = true
        await merchantStaff.user.save({ transaction: t })
      }

      Object.assign(merchantStaff, req.body)

      if (req.body.archivedAt === true || req.body.archivedAt === false) {
        merchantStaff.setDataValue('archivedAt', req.body.archivedAt ? new Date() : null)
      }

      if (merchantStaff.changed()) updated = true
      await merchantStaff.save({ transaction: t })

      if (updated) {
        merchantStaff = await scopedMerchantStaff.findByPk(merchantStaff.id, { transaction: t })
        await auth.removeAuthByUserId(merchantStaff.userId)
      }
    }
  })

  msg.expressUpdateEntityResponse(
    res,
    updated,
    merchantStaff,
    found
  )
}

module.exports.deleteMerchantStaff = async (req, res, next) => {
  let scopedMerchantStaff = models.merchantStaff.scope('admin', 'paranoid')
  let merchantStaff

  await models.sequelize.transaction(async t => {
    merchantStaff = await scopedMerchantStaff.findByPk(req.params.merchantStaffId, { transaction: t })
    if (merchantStaff) {
      await merchantStaff.destroy({ force: true, transaction: t })
      if (merchantStaff.user) {
        await merchantStaff.user.destroy({ force: true, transaction: t })
      }
      await auth.removeAuthByUserId(merchantStaff.userId)
    }
  })

  msg.expressDeleteEntityResponse(
    res,
    merchantStaff
  )
}

module.exports.createMerchantStaffMiddlewares = [
  merchantStaffValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createMerchantStaff,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.updateMerchantStaffMiddlewares = [
  merchantStaffValidator.bodyUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.updateMerchantStaff,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.getMerchantStaffsMiddlewares = [
  queryToSequelizeMiddleware.commonValidator,
  queryToSequelizeMiddleware.paginationValidator(['merchantStaff']),
  queryToSequelizeMiddleware.filterValidator(['merchantStaff', 'user']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.common,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  module.exports.getMerchantStaffs
]

module.exports.deleteMerchantStaffMiddlewares = [
  module.exports.deleteMerchantStaff,
  errorMiddleware.sequelizeErrorHandler
]
