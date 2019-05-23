'use strict'

const _ = require('lodash')

const msg = require('../libs/msg')
const auth = require('../libs/auth')

const userValidator = require('../validators/userValidator')

const { body } = require('express-validator/check')

const queryMiddleware = require('../middlewares/queryMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const models = require('../models')

const commonAdminValidator = [
  body('description').isString().optional(),
  body('email').isEmail().optional()
]

module.exports.createAdminValidator = [
  body('name').isString().not().isEmpty(),
  userValidator.bodyUserCreate([auth.userTypes.ADMIN], _.values(auth.userRoles))
]

module.exports.updateAdminValidator = [
  commonAdminValidator,
  body('name').isString().not().isEmpty().optional(),
  userValidator.bodyUserUpdate([auth.userTypes.ADMIN], _.values(auth.userRoles))
]

module.exports.createAdmin = async (req, res, next) => {
  let admin

  await models.sequelize.transaction(async t => {
    admin = await models.admin.create(req.body, {
      include: [ models.user ],
      transaction: t
    })
  })

  msg.expressCreateEntityResponse(
    res,
    await models.admin
      .scope('admin')
      .findByPk(admin.id)
  )
}

module.exports.getAdmins = async (req, res, next) => {
  let query = {
    where: {}
  }

  let scopedAdmin = req.applySequelizeCommonScope(models.admin.scope('adminHead'))

  if (req.params.adminId) {
    query.where.id = req.params.adminId
    msg.expressGetEntityResponse(
      res,
      await scopedAdmin.findOne(query)
    )
  } else {
    scopedAdmin =
      req.applySequelizeFiltersScope(
        req.applySequelizePaginationScope(
          scopedAdmin
        )
      )
    if (req.query.get_count) {
      let admins = await scopedAdmin.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        admins.rows,
        admins.count,
        req
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await await scopedAdmin.findAll(query)
      )
    }
  }
}

module.exports.updateAdmin = async (req, res, next) => {
  let scopedAdmin = models.admin.scope('adminHead', { paranoid: false })
  let updateCount = 0
  let admin
  let found = false

  await models.sequelize.transaction(async t => {
    admin = await scopedAdmin.findOne({ where: { id: req.params.adminId } }, { transaction: t })
    if (admin) {
      found = true
      if (req.body.user) {
        Object.assign(admin.user, req.body.user)
        delete req.body.user
        if (admin.user.changed()) updateCount++
        await admin.user.save({ transaction: t })
      }
      Object.assign(admin, req.body)
      if (!req.body.archivedAt) {
        admin.setDataValue('archivedAt', null)
      } else {
        admin.setDataValue('archivedAt', new Date())
      }
      if (req.body.archivedAt === null) admin.setDataValue(new Date())
      if (admin.changed()) updateCount++
      await admin.save({ transaction: t })
    }
  })

  if (updateCount) {
    admin = await scopedAdmin.findOne({ where: { id: req.params.adminId }, paranoid: false })
    await auth.removeAuthByUserId(admin.userId)
  }

  msg.expressUpdateEntityResponse(
    res,
    updateCount,
    admin,
    found
  )
}

module.exports.deleteAdmin = async (req, res, next) => {
  let scopedAdmin = models.admin.scope('adminHead', { paranoid: false })
  let admin

  await models.sequelize.transaction(async t => {
    admin = await scopedAdmin.findByPk(req.params.adminId)
    if (admin) {
      await admin.destroy({ force: true, transaction: t })
      await admin.user.destroy({ force: true, transaction: t })
    }
  })

  if (admin) await auth.removeAuthByUserId(admin.userId)

  msg.expressDeleteEntityResponse(
    res,
    admin,
    admin
  )
}

module.exports.createAdminMiddlewares = [
  exports.createAdminValidator,
  errorMiddleware.validatorErrorHandler,
  exports.createAdmin,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.updateAdminMiddlewares = [
  exports.updateAdminValidator,
  errorMiddleware.validatorErrorHandler,
  exports.updateAdmin,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.getAdminsMiddlewares = [
  queryMiddleware.commonValidator,
  queryMiddleware.paginationToSequelizeValidator('admin'),
  queryMiddleware.filtersToSequelizeValidator(['admin', 'user']),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  queryMiddleware.commonToSequelize,
  module.exports.getAdmins
]
