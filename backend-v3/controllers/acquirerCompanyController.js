'use strict'

const msg = require('../libs/msg')
const models = require('../models')

const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const acquirerCompanyValidator = require('../validators/acquirerCompanyValidator')

module.exports.createAcquirerCompany = async (req, res, next) => {
  let acquirerCompany

  await models.sequelize.transaction(async t => {
    acquirerCompany = await models.acquirerCompany.create(req.body, {
      transaction: t
    })
    acquirerCompany = await models.acquirerCompany.findByPk(
      acquirerCompany.id,
      { transaction: t }
    )
  })

  msg.expressCreateEntityResponse(res, acquirerCompany)
}

module.exports.getAcquirerCompanies = async (req, res, next) => {
  const query = { where: {} }

  if (req.params.acquirerCompanyId) {
    const scopedAcquirerCompany = req.applySequelizeCommonScope(
      models.acquirerCompany.scope('admin')
    )
    query.where.id = req.params.acquirerCompanyId
    msg.expressGetEntityResponse(
      res,
      await scopedAcquirerCompany.findOne(query)
    )
  } else {
    let scopedAcquirerCompany = models.acquirerCompany.scope()
    scopedAcquirerCompany = req.applySequelizeCommonScope(
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(scopedAcquirerCompany)
      )
    )
    if (req.query.get_count) {
      const outlets = await scopedAcquirerCompany.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        outlets.rows,
        outlets.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedAcquirerCompany.findAll(query)
      )
    }
  }
}

module.exports.updateAcquirerCompany = async (req, res, next) => {
  const scopedAcquirerCompany = models.acquirerCompany.scope('paranoid')
  let acquirerCompany

  let updated = false
  let found = false

  await models.sequelize.transaction(async t => {
    acquirerCompany = await scopedAcquirerCompany.findByPk(
      req.params.acquirerCompanyId,
      {
        transaction: t
      }
    )
    if (acquirerCompany) {
      found = true

      Object.assign(acquirerCompany, req.body)

      if (req.body.archivedAt === true || req.body.archivedAt === false) {
        acquirerCompany.setDataValue(
          'archivedAt',
          req.body.archivedAt ? new Date() : null
        )
      }

      if (acquirerCompany.changed()) updated = true
      await acquirerCompany.save({ transaction: t })

      if (updated) {
        acquirerCompany = await scopedAcquirerCompany.findByPk(
          acquirerCompany.id,
          { transaction: t }
        )
      }
    }
  })

  msg.expressUpdateEntityResponse(res, updated, acquirerCompany, found)
}

module.exports.deleteAcquirerCompany = async (req, res, next) => {
  const scopedAcquirerCompany = models.acquirerCompany.scope('paranoid')
  let acquirerCompany

  await models.sequelize.transaction(async t => {
    acquirerCompany = await scopedAcquirerCompany.findByPk(
      req.params.acquirerCompanyId,
      { transaction: t }
    )
    if (acquirerCompany) { await acquirerCompany.destroy({ force: true, transaction: t }) }
  })

  msg.expressDeleteEntityResponse(res, acquirerCompany)
}

module.exports.createAcquirerCompanyMiddlewares = [
  acquirerCompanyValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createAcquirerCompany,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.updateAcquirerCompanyMiddlewares = [
  acquirerCompanyValidator.bodyUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.updateAcquirerCompany,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.getAcquirerCompaniesMiddlewares = [
  queryToSequelizeMiddleware.commonValidator,
  queryToSequelizeMiddleware.paginationValidator(['acquirerCompany']),
  queryToSequelizeMiddleware.filterValidator(['acquirerCompany']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  queryToSequelizeMiddleware.common,
  exports.getAcquirerCompanies
]

module.exports.deleteAcquirerCompanyMiddlewares = [
  exports.deleteAcquirerCompany,
  errorMiddleware.sequelizeErrorHandler
]
