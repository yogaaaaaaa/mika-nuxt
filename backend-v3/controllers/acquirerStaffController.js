'use strict'

const msg = require('../libs/msg')
const auth = require('../libs/auth')
const models = require('../models')

const userHelper = require('./helpers/userHelper')

const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const acquirerStaffValidator = require('../validators/acquirerStaffValidator')

module.exports.getAcquirerStaffs = async (req, res, next) => {
  let scopedAcquirerStaff = req.applySequelizeCommonScope(
    models.acquirerStaff.scope('admin')
  )
  const query = { where: {} }

  if (req.params.acquirerStaffId) {
    query.where.id = req.params.acquirerStaffId
    msg.expressGetEntityResponse(res, await scopedAcquirerStaff.findOne(query))
  } else {
    scopedAcquirerStaff = req.applySequelizeFilterScope(
      req.applySequelizePaginationScope(scopedAcquirerStaff)
    )
    if (req.query.get_count) {
      const AcquirerStaffs = await scopedAcquirerStaff.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        AcquirerStaffs.rows,
        AcquirerStaffs.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedAcquirerStaff.findAll(query)
      )
    }
  }
}

module.exports.getAcquirerStaff = async (req, res, next) => {
  const acquirerStaff = await models.acquirerStaff
    .scope('acquirerStaff')
    .findByPk(req.auth.acquirerStaffId)

  if (!acquirerStaff) throw Error('AcquirerStaff should be exist')

  msg.expressGetEntityResponse(res, acquirerStaff)
}

module.exports.createAcquirerStaff = async (req, res, next) => {
  let user
  let acquirerStaff

  let createdAcquirerStaff
  let generatedPassword

  await models.sequelize.transaction(async t => {
    user = models.user.build(req.body.user)
    generatedPassword = await auth.resetPassword(
      user,
      req.query.humane_password
    )
    await user.save({ transaction: t })

    acquirerStaff = models.acquirerStaff.build(req.body)
    acquirerStaff.userId = user.id
    await acquirerStaff.save({ transaction: t })

    createdAcquirerStaff = await models.acquirerStaff
      .scope('admin')
      .findByPk(acquirerStaff.id, { transaction: t })
    createdAcquirerStaff = createdAcquirerStaff.toJSON()
    createdAcquirerStaff.user.password = generatedPassword
  })
  msg.expressCreateEntityResponse(res, createdAcquirerStaff)
}

module.exports.updateAcquirerStaff = async (req, res, next) => {
  const scopedAcquirerStaff = models.acquirerStaff.scope('adminUpdate')
  let acquirerStaff

  let updated = false
  let found = false

  await models.sequelize.transaction(async t => {
    acquirerStaff = await scopedAcquirerStaff.findByPk(
      req.params.acquirerStaffId,
      { transaction: t }
    )
    if (acquirerStaff) {
      found = true

      if (req.body.user) {
        Object.assign(acquirerStaff.user, req.body.user)
        await auth.checkPasswordUpdate(acquirerStaff.user)
        delete req.body.user

        if (acquirerStaff.user.changed()) updated = true
        await acquirerStaff.user.save({ transaction: t })
      }

      Object.assign(acquirerStaff, req.body)

      if (req.body.archivedAt === true || req.body.archivedAt === false) {
        acquirerStaff.setDataValue(
          'archivedAt',
          req.body.archivedAt ? new Date() : null
        )
      }

      if (acquirerStaff.changed()) updated = true
      await acquirerStaff.save({ transaction: t })

      if (updated) {
        acquirerStaff = await models.acquirerStaff
          .scope('admin')
          .findByPk(acquirerStaff.id, { transaction: t })
        await auth.removeAuthByUserId(acquirerStaff.userId)
      }
    }
  })

  msg.expressUpdateEntityResponse(res, updated, acquirerStaff, found)
}

module.exports.deleteAcquirerStaff = async (req, res, next) => {
  const scopedAcquirerStaff = models.acquirerStaff.scope('admin')
  let acquirerStaff

  await models.sequelize.transaction(async t => {
    acquirerStaff = await scopedAcquirerStaff.findByPk(
      req.params.acquirerStaffId,
      { transaction: t }
    )
    if (acquirerStaff) {
      await acquirerStaff.destroy({ force: true, transaction: t })
      if (acquirerStaff.user) {
        await acquirerStaff.user.destroy({ force: true, transaction: t })
      }
      await auth.removeAuthByUserId(acquirerStaff.userId)
    }
  })

  msg.expressDeleteEntityResponse(res, acquirerStaff)
}

module.exports.getAcquirerStaffsMiddlewares = [
  queryToSequelizeMiddleware.commonValidator,
  queryToSequelizeMiddleware.paginationValidator(['acquirerStaff']),
  queryToSequelizeMiddleware.filterValidator(['acquirerStaff', 'user']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.common,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  module.exports.getAcquirerStaffs
]

module.exports.createAcquirerStaffMiddlewares = [
  acquirerStaffValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createAcquirerStaff,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.resetAcquirerStaffPassword = userHelper.createResetUserPasswordHandler('acquirerStaff')

module.exports.updateAcquirerStaffMiddlewares = [
  acquirerStaffValidator.bodyUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.updateAcquirerStaff,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.deleteAcquirerStaffMiddlewares = [
  module.exports.deleteAcquirerStaff,
  errorMiddleware.sequelizeErrorHandler
]
