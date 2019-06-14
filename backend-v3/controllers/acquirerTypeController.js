'use strict'

const msg = require('../libs/msg')
const models = require('../models')

const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const acquirerTypeValidator = require('../validators/acquirerTypeValidator')

module.exports.createAcquirerType = async (req, res, next) => {
  let acquirerType

  acquirerType = await models.acquirerType.create(req.body)

  msg.expressCreateEntityResponse(
    res,
    await models.acquirerType
      .findByPk(acquirerType.id)
  )
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

module.exports.updateAcquirerType = async (req, res, next) => {
  let scopedAcquirerType = models.acquirerType.scope('paranoid')
  let acquirerType

  let updated = false
  let found = false

  await models.sequelize.transaction(async t => {
    acquirerType = await scopedAcquirerType.findByPk(req.params.acquirerTypeId, { transaction: t })
    if (acquirerType) {
      found = true

      Object.assign(acquirerType, req.body)

      if (req.body.archivedAt === true || req.body.archivedAt === false) {
        acquirerType.setDataValue('archivedAt', req.body.archivedAt ? new Date() : null)
      }

      if (acquirerType.changed()) updated = true
      await acquirerType.save({ transaction: t })
    }
  })

  if (updated) {
    acquirerType = await scopedAcquirerType.findByPk(req.params.acquirerTypeId)
  }

  msg.expressUpdateEntityResponse(
    res,
    updated,
    acquirerType,
    found
  )
}

module.exports.deleteAcquirerType = async (req, res, next) => {
  let scopedAcquirerType = models.acquirerType.scope('paranoid')
  let acquirerType

  await models.sequelize.transaction(async t => {
    acquirerType = await scopedAcquirerType.findByPk(req.params.acquirerTypeId, { transaction: t })
    if (acquirerType) await acquirerType.destroy({ force: true, transaction: t })
  })

  msg.expressDeleteEntityResponse(
    res,
    acquirerType
  )
}

module.exports.createAcquirerTypeMiddlewares = [
  acquirerTypeValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createAcquirerType,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.updateAcquirerTypeMiddlewares = [
  acquirerTypeValidator.bodyUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.updateAcquirerType,
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
