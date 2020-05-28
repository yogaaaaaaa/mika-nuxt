'use strict'

const models = require('models')
const { Op } = models.Sequelize
const notif = require('libs/notif')
const msg = require('libs/msg')

const identifierValidator = require('./helpers/identifierValidator')
const uid = require('libs/uid')

const cipherboxMiddleware = require('middlewares/cipherboxMiddleware')
const errorMiddleware = require('middlewares/errorMiddleware')
const crudGenerator = require('./helpers/crudGenerator')
const trxManager = require('libs/trxManager')

const isEnvProduction = process.env.NODE_ENV === 'production'

module.exports.startAgentSettle = async (req, res, next) => {
  await trxManager.agentSettle({
    agentId: req.auth.agentId,
    settleBatchId: req.params.settleBatchId,
    callback: (err, agentSettleResult) => {
      if (err) {
        console.error(err)
      }
    },
    ctxOptions: {
      debug: isEnvProduction ? undefined : req.body.debug
    }
  })
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS_TRANSACTION_SETTLEMENT_STARTED
  )
}

module.exports.startAgentSettleBulk = async (req, res, next) => {
  const jobRef = (await uid.generateKsuid()).canonical
  const settleBatches = await models.settleBatch.findAll({
    attributes: [
      'id',
      'status',
      'createdAt',
      'updatedAt'
    ],
    where: {
      agentId: req.auth.agentId,
      status: {
        [Op.ne]: trxManager.settleBatchStatuses.CLOSED
      }
    }
  })

  if (settleBatches.length) {
    // Update all to processing
    await models.settleBatch.update({
      status: trxManager.settleBatchStatuses.PROCESSING
    }, {
      where: {
        id: {
          [Op.in]: settleBatches.map(settleBatch => settleBatch.id)
        }
      }
    })
    setImmediate(async () => {
      const closedSettleBatchIds = []
      const erroredSettleBatchIds = []
      for (const settleBatch of settleBatches) {
        try {
          const agentSettleResult = await trxManager.agentSettleAsync({
            agentId: req.auth.agentId,
            settleBatchId: settleBatch.id,
            ctxOptions: {
              debug: isEnvProduction ? undefined : req.body.debug
            }
          })
          if (agentSettleResult.settleBatchStatus === trxManager.settleBatchStatuses.CLOSED) {
            closedSettleBatchIds.push(settleBatch.id)
          } else {
            erroredSettleBatchIds.push(settleBatch.id)
          }
        } catch (err) {
          console.error(err)
          erroredSettleBatchIds.push(settleBatch.id)
        }
      }
      await notif.notifToAgent(
        req.auth.agentId,
        msg.createNotification(msg.eventTypes.EVENT_BATCH_JOB, {
          jobRef,
          erroredSettleBatchIds,
          closedSettleBatchIds
        })
      )
    })

    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_BATCH_JOB_STARTED,
      {
        jobRef,
        settleBatches
      }
    )
  } else {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_ERROR_BATCH_JOB_NO_DATA
    )
  }
}

module.exports.startAgentSettleMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  identifierValidator.identifierIntValidator([
    'params.settleBatchId'
  ]),
  errorMiddleware.validatorErrorHandler,
  exports.startAgentSettle
]

module.exports.startAgentSettleBulkMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  exports.startAgentSettleBulk
]

module.exports.getAgentSettleBatchMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'settleBatch',
    modelScope: ({ req }) =>
      ({ method: ['agent', req.auth.agentId] }),
    identifierSource: {
      path: 'params.settleBatchId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['settleBatch']
    },
    sequelizeFilterScopeParam: {
      validModels: [
        'settleBatch',
        'acquirerConfig',
        'acquirerConfigAgent',
        'acquirerTerminal',
        'acquirerTerminalCommon',
        'acquirerCompany'
      ]
    }
  })
]

module.exports.getSettleBatchMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'settleBatch',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.settleBatchId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['settleBatch']
    },
    sequelizeFilterScopeParam: {
      validModels: [
        'settleBatch',
        'agent',
        'outlet',
        'merchant',
        'acquirerConfig',
        'acquirerConfigAgent',
        'acquirerTerminal',
        'acquirerTerminalCommon',
        'acquirerCompany'
      ]
    }
  })
]
