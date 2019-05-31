'use strict'

const _ = require('lodash')

const msg = require('../libs/msg')
const models = require('../models')

const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const acquirerConfigValidator = require('../validators/acquirerConfigValidator')

module.exports.createAcquirerConfig = async (req, res, next) => {
  let acquirerConfig
  if (req.params.merchantId) {
    req.body.merchantId = req.params.merchantId
  }

  await models.sequelize.transaction(async t => {
    acquirerConfig = await models.acquirerConfig.create(req.body, { transaction: t })
    if (_.isPlainObject(req.body.config)) {
      await models.acquirerConfigKv.setKv(acquirerConfig.id, req.body.config, t)
    }
  })

  msg.expressCreateEntityResponse(
    res,
    await models.acquirerConfig
      .scope('admin')
      .findByPk(acquirerConfig.id)
  )
}

module.exports.getAcquirerConfigs = async (req, res, next) => {
  let scopedAcquirerConfig = req.applySequelizeCommonScope(models.acquirerConfig.scope('admin'))
  let query = { where: {} }

  if (req.params.acquirerConfigId) {
    query.where.id = req.params.acquirerConfigId
    msg.expressGetEntityResponse(
      res,
      await scopedAcquirerConfig.findOne(query)
    )
  } else {
    scopedAcquirerConfig =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedAcquirerConfig
        )
      )
    if (req.query.get_count) {
      let acquirerConfigs = await scopedAcquirerConfig.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        acquirerConfigs.rows,
        acquirerConfigs.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedAcquirerConfig.findAll(query)
      )
    }
  }
}

module.exports.updateAcquirerConfig = async (req, res, next) => {
  let scopedAcquirerConfig = models.acquirerConfig.scope('paranoid')
  let acquirerConfig

  let updated = false
  let found = false

  await models.sequelize.transaction(async t => {
    acquirerConfig = await scopedAcquirerConfig.findByPk(req.params.acquirerConfigId, { transaction: t })
    if (acquirerConfig) {
      found = true

      Object.assign(acquirerConfig, req.body)

      if (req.body.archivedAt === true || req.body.archivedAt === false) {
        acquirerConfig.setDataValue('archivedAt', req.body.archivedAt ? new Date() : null)
      }

      if (acquirerConfig.changed()) updated = true
      await acquirerConfig.save({ transaction: t })

      if (_.isPlainObject(req.body.config)) {
        await models.acquirerConfigKv.setKv(acquirerConfig.id, req.body.config, t)
        updated = true
      }
    }
  })

  if (updated) {
    acquirerConfig = await scopedAcquirerConfig.scope('admin').findByPk(req.params.acquirerConfigId)
  }

  msg.expressUpdateEntityResponse(
    res,
    updated,
    acquirerConfig,
    found
  )
}

module.exports.deleteAcquirerConfig = async (req, res, next) => {
  let scopedAcquirerConfig = models.acquirerConfig.scope('paranoid')
  let acquirerConfig

  await models.sequelize.transaction(async t => {
    acquirerConfig = await scopedAcquirerConfig.findByPk(req.params.acquirerConfigId, { transaction: t })
    if (acquirerConfig) {
      await models.acquirerConfigKv.setKv(acquirerConfig.id, {}, t)
      await acquirerConfig.destroy({ force: true, transaction: t })
    }
  })

  msg.expressDeleteEntityResponse(
    res,
    acquirerConfig,
    acquirerConfig
  )
}

module.exports.createAcquirerConfigMiddlewares = [
  acquirerConfigValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createAcquirerConfig,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.updateAcquirerConfigMiddlewares = [
  acquirerConfigValidator.bodyUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.updateAcquirerConfig,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.getAcquirerConfigsMiddlewares = [
  queryToSequelizeMiddleware.commonValidator,
  queryToSequelizeMiddleware.paginationValidator(['acquirerConfig']),
  queryToSequelizeMiddleware.filterValidator(['acquirerConfig']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  queryToSequelizeMiddleware.common,
  exports.getAcquirerConfigs
]

module.exports.deleteAcquirerConfigMiddlewares = [
  exports.deleteAcquirerConfig,
  errorMiddleware.sequelizeErrorHandler
]
