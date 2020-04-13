'use strict'

const msg = require('../libs/msg')
const models = require('../models')

const trxManager = require('../libs/trxManager')

const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')
const crudGenerator = require('./helpers/crudGenerator')
const identifierValidator = require('./helpers/identifierValidator')

const acquirerValidator = require('validators/acquirerValidator')

module.exports.getAgentAcquirers = async (req, res, next) => {
  const query = {
    where: {
      id: req.auth.agentId
    }
  }

  if (req.params.acquirerId !== undefined) {
    const scopedAgent = req.applySequelizeCommonScope(
      models.agent.scope({ method: ['agentAcquirer', req.params.acquirerId] })
    )

    let acquirer
    const agent = await scopedAgent.findOne(query)
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
    const scopedAgent = req.applySequelizeCommonScope(
      models.agent.scope('agentAcquirer')
    )

    let acquirers
    const agent = await scopedAgent.findOne(query)
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
  const query = {
    where: {
      id: req.auth.merchantStaffId
    }
  }

  if (req.params.acquirerId !== undefined) {
    let acquirer = null

    const merchantStaff = await models.merchantStaff.scope(
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

    const merchantStaff = await models.merchantStaff.scope(
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

module.exports.getAgentAcquirersMiddlewares = [
  identifierValidator.identifierIntValidator([
    'params.acquirerId'
  ]),
  queryToSequelizeMiddleware.commonValidator,
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.common,
  exports.getAgentAcquirers
]

module.exports.getMerchantStaffAcquirersMiddlewares = [
  identifierValidator.identifierIntValidator([
    'params.acquirerId'
  ]),
  exports.getMerchantStaffAcquirers
]

module.exports.createAcquirerMiddlewares = [
  acquirerValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'acquirer',
    modelScope: 'admin'
  })
]

module.exports.getAcquirersMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'acquirer',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['acquirer', 'merchant']
    },
    sequelizeFilterScopeParam: {
      validModels: ['acquirer', 'merchant']
    }
  })
]

module.exports.updateAcquirerMiddlewares = [
  acquirerValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'acquirer',
    identifierSource: {
      path: 'params.acquirerId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.deleteAcquirerMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'acquirer',
    identifierSource: {
      path: 'params.acquirerId',
      as: 'id',
      type: 'int'
    }
  })
]
