'use strict'

const msg = require('../libs/msg')
const auth = require('../libs/auth')
const models = require('../models')

const userHelper = require('./helpers/userHelper')

const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const adminValidator = require('../validators/adminValidator')

module.exports.getAdmin = async (req, res, next) => {
  const admin = await models.admin.scope('admin').findByPk(req.auth.adminId)

  if (!admin) throw Error('admin should be exist')

  msg.expressGetEntityResponse(
    res,
    admin
  )
}

module.exports.createAdmin = async (req, res, next) => {
  let user
  let admin

  let createdAdmin
  let generatedPassword

  await models.sequelize.transaction(async t => {
    user = models.user.build(req.body.user)
    generatedPassword = await auth.resetPassword(user, req.query.humane_password)
    await user.save({ transaction: t })

    admin = models.admin.build(req.body)
    admin.userId = user.id
    await admin.save({ transaction: t })

    createdAdmin = await models.admin
      .scope('admin')
      .findByPk(admin.id, { transaction: t })
    createdAdmin = createdAdmin.toJSON()
    createdAdmin.user.password = generatedPassword
  })
  msg.expressCreateEntityResponse(
    res,
    createdAdmin
  )
}

module.exports.getAdmins = async (req, res, next) => {
  let scopedAdmin = req.applySequelizeCommonScope(models.admin.scope('admin'))
  const query = { where: {} }

  if (req.params.adminId) {
    query.where.id = req.params.adminId
    msg.expressGetEntityResponse(
      res,
      await scopedAdmin.findOne(query)
    )
  } else {
    scopedAdmin =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedAdmin
        )
      )
    if (req.query.get_count) {
      const admins = await scopedAdmin.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        admins.rows,
        admins.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedAdmin.findAll(query)
      )
    }
  }
}

module.exports.updateAdmin = async (req, res, next) => {
  const scopedAdmin = models.admin.scope('adminUpdate')
  let admin

  let updated = false
  let found = false

  await models.sequelize.transaction(async t => {
    admin = await scopedAdmin.findByPk(req.params.adminId, { transaction: t })
    if (admin) {
      found = true

      if (req.body.user) {
        Object.assign(admin.user, req.body.user)
        await auth.checkPasswordUpdate(admin.user)
        delete req.body.user

        if (admin.user.changed()) updated = true
        await admin.user.save({ transaction: t })
      }

      Object.assign(admin, req.body)

      if (req.body.archivedAt === true || req.body.archivedAt === false) {
        admin.setDataValue('archivedAt', req.body.archivedAt ? new Date() : null)
      }

      if (admin.changed()) updated = true
      await admin.save({ transaction: t })

      if (updated) {
        admin = await models.admin.scope('admin').findByPk(admin.id, { transaction: t })
        await auth.removeAuthByUserId(admin.userId)
      }
    }
  })

  msg.expressUpdateEntityResponse(
    res,
    updated,
    admin,
    found
  )
}

module.exports.deleteAdmin = async (req, res, next) => {
  const scopedAdmin = models.admin.scope('admin', { paranoid: false })
  let admin

  await models.sequelize.transaction(async t => {
    admin = await scopedAdmin.findByPk(req.params.adminId, { transaction: t })
    if (admin) {
      await admin.destroy({ force: true, transaction: t })
      if (admin.user) {
        await admin.user.destroy({ force: true, transaction: t })
      }
      await auth.removeAuthByUserId(admin.userId)
    }
  })

  msg.expressDeleteEntityResponse(
    res,
    admin
  )
}

module.exports.resetAdminPassword = userHelper.createResetUserPasswordHandler('admin')

module.exports.createAdminMiddlewares = [
  adminValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createAdmin,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.updateAdminMiddlewares = [
  adminValidator.bodyUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.updateAdmin,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.getAdminsMiddlewares = [
  queryToSequelizeMiddleware.commonValidator,
  queryToSequelizeMiddleware.paginationValidator(['admin']),
  queryToSequelizeMiddleware.filterValidator(['admin', 'user']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.common,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  module.exports.getAdmins
]

module.exports.deleteAdminMiddlewares = [
  module.exports.deleteAdmin,
  errorMiddleware.sequelizeErrorHandler
]
