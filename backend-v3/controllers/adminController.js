'use strict'

const msg = require('../helpers/msg')

const userValidator = require('../validators/userValidator')
const { body } = require('express-validator/check')

const queryMiddleware = require('../middlewares/queryMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const models = require('../models')
// const Sequelize = models.Sequelize
// const Op = Sequelize.Op

module.exports.createAdminValidator = [
  body('name').isString(),
  body('description').isString().optional(),
  body('email').isEmail().optional()
]

module.exports.createAdmin = async (req, res, next) => {
  let admin = null

  await models.sequelize.transaction(async t => {
    admin = await models.admin.create(req.body, {
      include: [ models.user ],
      transaction: t
    })
  })

  admin = await models.admin
    .scope('admin')
    .findByPk(admin.id)

  msg.expressCreateResponse(
    res,
    msg.msgTypes.MSG_SUCCESS_ENTITY_CREATED,
    admin
  )
}

module.exports.createAdminMiddlewares = [
  exports.createAdminValidator,
  userValidator.bodyUser,
  errorMiddleware.validatorErrorHandler,
  exports.createAdmin,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.getAdmins = async (req, res, next) => {
  let query = {
    where: {}
  }

  if (Object.keys(req.params).some(key => req.params[key])) {
    if (req.params.adminId) {
      query.where.id = req.params.adminId
    }

    let admin = await models.admin.scope().findOne(query)
    msg.expressCreateResponse(
      res,
      admin
        ? msg.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : msg.msgTypes.MSG_SUCCESS_SINGLE_ENTITY_NOT_FOUND,
      admin || undefined
    )
  } else {
    req.applyPaginationSequelize(query)
    req.sequelizeFiltersScope(query)
    if (req.query.get_count) {
      let admins = await models.admin.scope('admin').findAndCountAll(query)
      msg.expressCreateResponse(
        res,
        admins.rows.length > 0
          ? msg.msgTypes.MSG_SUCCESS_ENTITY_FOUND
          : msg.msgTypes.MSG_SUCCESS_NO_ENTITY,
        admins.rows,
        msg.createPaginationMeta(req.query.page, req.query.per_page, admins.count)
      )
    } else {
      let admins = await models.admin.scope('admin').findAll(query)
      msg.expressCreateResponse(
        res,
        admins.length > 0
          ? msg.msgTypes.MSG_SUCCESS_ENTITY_FOUND
          : msg.msgTypes.MSG_SUCCESS_NO_ENTITY,
        admins
      )
    }
  }
}

module.exports.getAdminsMiddlewares = [
  queryMiddleware.paginationToSequelizeValidator('admin'),
  queryMiddleware.filtersToSequelizeValidator(['admin']),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  module.exports.getAdmins
]

module.exports.updateAdmin = async (req, res, next) => {

}

module.exports.updateAdminValidator = [
  exports.createAdminValidator,
  userValidator.bodyUser
]

module.exports.updateAdminMiddlewares = [

]

module.exports.deleteAdmin = async (req, res, next) => {

}

module.exports.deleteAdminValidator = [

]

module.exports.deleteAdminMiddlewares = [

]
