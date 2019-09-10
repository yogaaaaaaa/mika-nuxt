'use strict'

const msg = require('../libs/msg')
const models = require('../models')

const trxManager = require('../libs/trxManager')

const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const acquirerValidator = require('../validators/acquirerValidator')

module.exports.getAgentAcquirers = async (req, res, next) => {
  let query = {
    where: {
      id: req.auth.agentId
    }
  }

  if (req.params.acquirerId) {
    let acquirer
    let agent = await models.agent.scope(
      { method: ['agentAcquirer', req.params.acquirerId] }
    ).findOne(query)

    if (agent) {
      if (agent.outlet.merchant.acquirers.length) {
        acquirer = agent.outlet.merchant.acquirers[0].toJSON()
        acquirer._handler = trxManager.getAcquirerInfo(acquirer.acquirerConfig.handler) || null
      }
    }

    msg.expressGetEntityResponse(
      res,
      acquirer
    )
  } else {
    let acquirers
    let agent = await models.agent.scope(
      'agentAcquirer'
    ).findOne(query)

    if (agent) {
      if (agent.outlet.merchant.acquirers.length) {
        acquirers = agent.outlet.merchant.acquirers
      }
    }

    msg.expressGetEntityResponse(
      res,
      acquirers ? acquirers.map((acquirer) => {
        acquirer = acquirer.toJSON()
        acquirer._handler = trxManager.getAcquirerInfo(acquirer.acquirerConfig.handler) || null
        return acquirer
      }) : []
    )
  }
}

module.exports.getMerchantStaffAcquirers = async (req, res, next) => {
  let query = {
    where: {
      id: req.auth.merchantStaffId
    }
  }

  if (req.params.acquirerId) {
    let acquirer = null

    let merchantStaff = await models.merchantStaff.scope(
      { method: ['merchantStaffAcquirer', req.params.acquirerId] }
    ).findOne(query)

    if (merchantStaff) {
      if (merchantStaff.merchant.acquirers.length) {
        acquirer = merchantStaff.merchant.acquirers[0]
      }
    }
    msg.expressGetEntityResponse(
      res,
      acquirer
    )
  } else {
    let acquirers = null

    let merchantStaff = await models.merchantStaff.scope(
      'merchantStaffAcquirer'
    ).findOne(query)

    if (merchantStaff) {
      if (merchantStaff.merchant.acquirers.length) {
        acquirers = merchantStaff.merchant.acquirers
      }
    }

    msg.expressGetEntityResponse(
      res,
      acquirers
    )
  }
}

module.exports.createAcquirer = async (req, res, next) => {
  if (req.params.merchantId) {
    req.body.merchantId = req.params.merchantId
  }

  let acquirer
  await models.sequelize.transaction(async t => {
    acquirer = await models.acquirer.create(req.body, { transaction: t })
    acquirer = await models.acquirer
      .scope('admin')
      .findByPk(acquirer.id, { transaction: t })
  })

  msg.expressCreateEntityResponse(
    res,
    acquirer
  )
}

module.exports.getAcquirers = async (req, res, next) => {
  let scopedAcquirer = req.applySequelizeCommonScope(models.acquirer.scope('admin'))
  let query = { where: {} }

  if (req.params.acquirerId) {
    query.where.id = req.params.acquirerId
    msg.expressGetEntityResponse(
      res,
      await scopedAcquirer.findOne(query)
    )
  } else {
    scopedAcquirer =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedAcquirer
        )
      )
    if (req.query.get_count) {
      let acquirers = await scopedAcquirer.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        acquirers.rows,
        acquirers.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedAcquirer.findAll(query)
      )
    }
  }
}

module.exports.updateAcquirer = async (req, res, next) => {
  let scopedAcquirer = models.acquirer.scope('paranoid')
  let acquirer

  let updated = false
  let found = false

  await models.sequelize.transaction(async t => {
    acquirer = await scopedAcquirer.findByPk(req.params.acquirerId, { transaction: t })
    if (acquirer) {
      found = true

      Object.assign(acquirer, req.body)

      if (req.body.archivedAt === true || req.body.archivedAt === false) {
        acquirer.setDataValue('archivedAt', req.body.archivedAt ? new Date() : null)
      }

      if (acquirer.changed()) updated = true
      await acquirer.save({ transaction: t })

      if (updated) {
        acquirer = await scopedAcquirer.findByPk(acquirer.id, { transaction: t })
      }
    }
  })

  msg.expressUpdateEntityResponse(
    res,
    updated,
    acquirer,
    found
  )
}

module.exports.deleteAcquirer = async (req, res, next) => {
  let scopedAcquirer = models.acquirer.scope('paranoid')
  let acquirer

  await models.sequelize.transaction(async t => {
    acquirer = await scopedAcquirer.findByPk(req.params.acquirerId, { transaction: t })
    if (acquirer) await acquirer.destroy({ force: true, transaction: t })
  })

  msg.expressDeleteEntityResponse(
    res,
    acquirer
  )
}

module.exports.createAcquirerMiddlewares = [
  acquirerValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createAcquirer,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.updateAcquirerMiddlewares = [
  acquirerValidator.bodyUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.updateAcquirer,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.getAcquirersMiddlewares = [
  queryToSequelizeMiddleware.commonValidator,
  queryToSequelizeMiddleware.paginationValidator(['acquirer']),
  queryToSequelizeMiddleware.filterValidator(['acquirer']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  queryToSequelizeMiddleware.common,
  exports.getAcquirers
]

module.exports.getMerchantStaffAcquirersMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['acquirer']),
  queryToSequelizeMiddleware.filterValidator(['acquirer'], ['*archivedAt']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  module.exports.getMerchantStaffAcquirers
]

module.exports.deleteAcquirerMiddlewares = [
  exports.deleteAcquirer,
  errorMiddleware.sequelizeErrorHandler
]
