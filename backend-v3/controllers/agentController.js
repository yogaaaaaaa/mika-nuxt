'use strict'

const msg = require('../helpers/msg')

// const { body } = require('express-validator/check')

const errorMiddleware = require('../middlewares/errorMiddleware')
const queryMiddleware = require('../middlewares/queryMiddleware')

const models = require('../models')
// const Sequelize = models.Sequelize

/**
 * Get current agent's (via `req.auth.agentId`)
 */
module.exports.getAgent = async (req, res, next) => {
  let agent = await models.agent
    .scope('agent')
    .findByPk(req.auth.agentId)

  if (!agent) throw Error('Agent should be exist')

  msg.expressGetEntityResponse(
    res,
    agent
  )
}

/**
 * Get agents under current merchant staff (via `req.auth.merchantStaffId`)
 */
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
      req.applySequelizeFiltersScope(
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
        req
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedAgent.findAll(query)
      )
    }
  }
}

module.exports.getMerchantStaffAgentsMiddlewares = [
  queryMiddleware.paginationToSequelizeValidator(['agent']),
  queryMiddleware.filtersToSequelizeValidator(['agent', 'outlet']),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  module.exports.getMerchantStaffAgents
]
