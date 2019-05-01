'use strict'

const msgFactory = require('../helpers/msgFactory')

const userValidator = require('../validators/userValidator')
const { body } = require('express-validator/check')

const queryMiddleware = require('../middlewares/queryMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const models = require('../models')
const Sequelize = models.Sequelize
const Op = Sequelize.Op

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

  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_SUCCESS_ENTITY_CREATED,
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

}

module.exports.getAdminsMiddlewares = [
  queryMiddleware.paginationToSequelizeValidator('admin'),
  queryMiddleware.filtersToSequelizeValidator(['admin', 'user']),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  module.exports.getAdmins
]

module.exports.updateAdmin = async (req, res, next) => {

}

module.exports.updateAdminValidator = [

]

module.exports.updateAdminMiddlewares = [

]
