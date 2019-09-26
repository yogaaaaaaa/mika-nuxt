'use strict'

const msg = require('../libs/msg')
const models = require('../models')

const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const terminalModelValidator = require('../validators/terminalModelValidator')

module.exports.createTerminalModel = async (req, res, next) => {
  let terminalModel

  await models.sequelize.transaction(async t => {
    terminalModel = await models.terminalModel.create(req.body, { transaction: t })
    terminalModel = await models.terminalModel.findByPk(terminalModel.id, { transaction: t })
  })

  msg.expressCreateEntityResponse(
    res,
    terminalModel
  )
}

module.exports.getTerminalModels = async (req, res, next) => {
  let scopedTerminalModel = req.applySequelizeCommonScope(models.terminalModel.scope('admin'))
  const query = { where: {} }

  if (req.params.terminalModelId) {
    query.where.id = req.params.terminalModelId
    msg.expressGetEntityResponse(
      res,
      await scopedTerminalModel.findOne(query)
    )
  } else {
    scopedTerminalModel =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedTerminalModel
        )
      )
    if (req.query.get_count) {
      const terminalModels = await scopedTerminalModel.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        terminalModels.rows,
        terminalModels.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedTerminalModel.findAll(query)
      )
    }
  }
}

module.exports.updateTerminalModel = async (req, res, next) => {
  const scopedTerminalModel = models.terminalModel.scope('paranoid')
  let terminalModel

  let updated = false
  let found = false

  await models.sequelize.transaction(async t => {
    terminalModel = await scopedTerminalModel.findByPk(req.params.terminalModelId, { transaction: t })
    if (terminalModel) {
      found = true

      Object.assign(terminalModel, req.body)

      if (req.body.archivedAt === true || req.body.archivedAt === false) {
        terminalModel.setDataValue('archivedAt', req.body.archivedAt ? new Date() : null)
      }

      if (terminalModel.changed()) updated = true
      await terminalModel.save({ transaction: t })

      if (updated) {
        terminalModel = await scopedTerminalModel.findByPk(terminalModel.id, { transaction: t })
      }
    }
  })

  msg.expressUpdateEntityResponse(
    res,
    updated,
    terminalModel,
    found
  )
}

module.exports.deleteTerminalModel = async (req, res, next) => {
  const scopedTerminalModel = models.terminalModel.scope('paranoid')
  let terminalModel

  await models.sequelize.transaction(async t => {
    terminalModel = await scopedTerminalModel.findByPk(req.params.terminalModelId, { transaction: t })
    if (terminalModel) await terminalModel.destroy({ force: true, transaction: t })
  })

  msg.expressDeleteEntityResponse(
    res,
    terminalModel
  )
}

module.exports.createTerminalModelMiddlewares = [
  terminalModelValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createTerminalModel,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.updateTerminalModelMiddlewares = [
  terminalModelValidator.bodyUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.updateTerminalModel,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.getTerminalModelsMiddlewares = [
  queryToSequelizeMiddleware.commonValidator,
  queryToSequelizeMiddleware.paginationValidator(['terminalModel']),
  queryToSequelizeMiddleware.filterValidator(['terminalModel']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  queryToSequelizeMiddleware.common,
  exports.getTerminalModels
]

module.exports.deleteTerminalModelMiddlewares = [
  module.exports.deleteTerminalModel,
  errorMiddleware.sequelizeErrorHandler
]
