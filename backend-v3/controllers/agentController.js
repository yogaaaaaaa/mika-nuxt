'use strict'

const msg = require('../libs/msg')
const auth = require('../libs/auth')
const models = require('../models')

const errorMiddleware = require('../middlewares/errorMiddleware')
const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')

const agentValidator = require('../validators/agentValidator')

module.exports.getAgent = async (req, res, next) => {
  let agent = await models.agent
    .scope('agent')
    .findByPk(req.auth.agentId)

  if (!agent) throw Error('agent should be exist')

  msg.expressGetEntityResponse(
    res,
    agent
  )
}

module.exports.getMerchantStaffAgents = async (req, res, next) => {
  let query = { where: {} }

  if (req.params.outletId) query.where.outletId = req.params.outletId

  if (req.params.agentId) {
    query.where.id = req.params.agentId
    msg.expressGetEntityResponse(
      res,
      await models.agent.scope('merchantStaff').findOne(query)
    )
  } else {
    let scopedAgent =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          models.agent.scope({ method: ['merchantStaff', req.auth.merchantStaffId] })
        )
      )
    if (req.query.get_count) {
      let agents = await scopedAgent.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        agents.rows,
        agents.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedAgent.findAll(query)
      )
    }
  }
}

module.exports.createAgent = async (req, res, next) => {
  let agent

  await models.sequelize.transaction(async t => {
    agent = await models.agent.create(req.body, {
      include: [ models.user ],
      transaction: t
    })
    agent = await models.agent
      .scope('admin')
      .findByPk(agent.id, { transaction: t })
  })

  msg.expressCreateEntityResponse(
    res,
    agent
  )
}

module.exports.getAgents = async (req, res, next) => {
  let scopedAgent = req.applySequelizeCommonScope(models.agent.scope('admin'))
  let query = { where: {} }

  if (req.params.agentId) {
    query.where.id = req.params.agentId
    msg.expressGetEntityResponse(
      res,
      await scopedAgent.findOne(query)
    )
  } else {
    scopedAgent =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedAgent
        )
      )
    if (req.query.get_count) {
      let agents = await scopedAgent.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        agents.rows,
        agents.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedAgent.findAll(query)
      )
    }
  }
}

module.exports.updateAgent = async (req, res, next) => {
  let scopedAgent = models.agent.scope('admin', 'paranoid')
  let agent

  let updated = false
  let found = false

  await models.sequelize.transaction(async t => {
    agent = await scopedAgent.findByPk(req.params.agentId, { transaction: t })
    if (agent) {
      found = true

      if (req.body.user) {
        Object.assign(agent.user, req.body.user)
        delete req.body.user

        if (agent.user.changed()) updated = true
        await agent.user.save({ transaction: t })
      }

      Object.assign(agent, req.body)

      if (req.body.archivedAt === true || req.body.archivedAt === false) {
        agent.setDataValue('archivedAt', req.body.archivedAt ? new Date() : null)
      }

      if (agent.changed()) updated = true
      await agent.save({ transaction: t })

      if (updated) {
        agent = await scopedAgent.findByPk(agent.id, { transaction: t })
        await auth.removeAuthByUserId(agent.userId)
      }
    }
  })

  msg.expressUpdateEntityResponse(
    res,
    updated,
    agent,
    found
  )
}

module.exports.deleteAgent = async (req, res, next) => {
  let scopedAgent = models.agent.scope('admin', 'paranoid')
  let agent

  await models.sequelize.transaction(async t => {
    agent = await scopedAgent.findByPk(req.params.agentId, { transaction: t })
    if (agent) {
      await agent.destroy({ force: true, transaction: t })
      if (agent.user) {
        await agent.user.destroy({ force: true, transaction: t })
      }
      await auth.removeAuthByUserId(agent.userId)
    }
  })

  msg.expressDeleteEntityResponse(
    res,
    agent
  )
}

module.exports.createAgentMiddlewares = [
  agentValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createAgent,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.updateAgentMiddlewares = [
  agentValidator.bodyUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.updateAgent,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.getAgentsMiddlewares = [
  queryToSequelizeMiddleware.commonValidator,
  queryToSequelizeMiddleware.paginationValidator(['agent']),
  queryToSequelizeMiddleware.filterValidator(['agent', 'outlet', 'user']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.common,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  module.exports.getAgents
]

module.exports.getMerchantStaffAgentsMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['agent']),
  queryToSequelizeMiddleware.filterValidator(['agent', 'outlet']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  module.exports.getMerchantStaffAgents
]

module.exports.deleteAgentMiddlewares = [
  module.exports.deleteAgent,
  errorMiddleware.sequelizeErrorHandler
]
