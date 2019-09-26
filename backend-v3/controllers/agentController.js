'use strict'

const msg = require('../libs/msg')
const auth = require('../libs/auth')
const models = require('../models')

const userHelper = require('./helpers/userHelper')

const errorMiddleware = require('../middlewares/errorMiddleware')
const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')

const agentValidator = require('../validators/agentValidator')

module.exports.getAgent = async (req, res, next) => {
  const agent = await models.agent
    .scope('agent')
    .findByPk(req.auth.agentId)

  if (!agent) throw Error('agent should be exist')

  msg.expressGetEntityResponse(
    res,
    agent
  )
}

module.exports.getMerchantStaffAgents = async (req, res, next) => {
  const query = { where: {} }
  const scopedAgent = models.agent.scope({ method: ['merchantStaff', req.auth.merchantStaffId] })

  if (req.params.outletId) query.where.outletId = req.params.outletId

  if (req.params.agentId) {
    query.where.id = req.params.agentId
    msg.expressGetEntityResponse(
      res,
      await scopedAgent.findOne(query)
    )
  } else {
    const localScopedAgent =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedAgent
        )
      )
    if (req.query.get_count) {
      const agents = await localScopedAgent.findAndCountAll(query)
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
        await localScopedAgent.findAll(query)
      )
    }
  }
}

module.exports.getAcquirerStaffAgents = async (req, res, next) => {
  const query = { where: {} }
  const scopedAgent = models.agent.scope({ method: ['acquirerStaff', req.auth.acquirerCompanyId] })

  if (req.params.agentId) {
    query.where.id = req.params.agentId
    msg.expressGetEntityResponse(
      res,
      await scopedAgent.findOne(query)
    )
  } else {
    const localScopedAgent =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedAgent
        )
      )
    if (req.query.get_count) {
      const agents = await localScopedAgent.findAndCountAll(query)
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
        await localScopedAgent.findAll(query)
      )
    }
  }
}

module.exports.createAgent = async (req, res, next) => {
  let user
  let agent

  let createdAgent
  let generatedPassword

  await models.sequelize.transaction(async t => {
    user = models.user.build(req.body.user)
    generatedPassword = await auth.resetPassword(user, req.query.humane_password)
    await user.save({ transaction: t })

    agent = models.agent.build(req.body)
    agent.userId = user.id
    await agent.save({ transaction: t })

    createdAgent = await models.agent
      .scope('admin')
      .findByPk(agent.id, { transaction: t })
    createdAgent = createdAgent.toJSON()
    createdAgent.user.password = generatedPassword
  })
  msg.expressCreateEntityResponse(
    res,
    createdAgent
  )
}

module.exports.getAgents = async (req, res, next) => {
  let scopedAgent = req.applySequelizeCommonScope(models.agent.scope('admin'))
  const query = { where: {} }

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
      const agents = await scopedAgent.findAndCountAll(query)
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
  const scopedAgent = models.agent.scope('adminUpdate')
  let agent

  let updated = false
  let found = false

  await models.sequelize.transaction(async t => {
    agent = await scopedAgent.findByPk(req.params.agentId, { transaction: t })
    if (agent) {
      found = true

      if (req.body.user) {
        Object.assign(agent.user, req.body.user)
        await auth.checkPasswordUpdate(agent.user)
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
        agent = await models.agent.scope('admin').findByPk(agent.id, { transaction: t })
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
  const scopedAgent = models.agent.scope('admin')
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

module.exports.resetAgentPassword = userHelper.createResetUserPasswordHandler('agent')

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

module.exports.getAcquirerStaffAgentsMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['agent']),
  queryToSequelizeMiddleware.filterValidator(['agent', 'outlet']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  module.exports.getAcquirerStaffAgents
]

module.exports.deleteAgentMiddlewares = [
  module.exports.deleteAgent,
  errorMiddleware.sequelizeErrorHandler
]
