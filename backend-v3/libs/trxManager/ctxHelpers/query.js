'use strict'

const models = require('models')
const Op = models.Sequelize.Op
const col = models.sequelize.col

const { transactionStatuses, settleBatchStatuses } = require('../constants')

module.exports.findUnfinishedTransaction = async (ctx, t) => {
  return models.transaction.findOne({
    where: {
      agentId: ctx.agent.id,
      acquirerId: ctx.acquirer.id,
      status: {
        [Op.in]: [
          transactionStatuses.CREATED,
          transactionStatuses.PROCESSING,
          transactionStatuses.REVERSING,
          transactionStatuses.REVERSING_VOID,
          transactionStatuses.VOIDING
        ]
      }
    },
    transaction: t
  })
}

module.exports.newTransaction = {}

module.exports.newTransaction.findAgentAndFriends = async (ctx, t) => {
  return models.agent
    .findOne({
      where: {
        id: ctx.transaction.agentId
      },
      include: [
        {
          model: models.outlet,
          required: true,
          include: [
            {
              model: models.merchant,
              required: true,
              include: [
                {
                  model: models.acquirer.scope({ method: ['agentExclusion', '"agent"."id"'] }),
                  required: false,
                  where: {
                    id: ctx.transaction.acquirerId
                  },
                  include: [
                    { model: models.acquirerType, required: true },
                    { model: models.acquirerConfig, required: true }
                  ]
                }
              ]
            }
          ]
        }
      ],
      transaction: t
    })
}

module.exports.newTransaction.findAcquirerConfigAgent = async (ctx, t) => {
  return models.acquirerConfigAgent
    .findOne({
      where: {
        acquirerConfigId: ctx.acquirer.acquirerConfigId,
        agentId: ctx.agent.id
      },
      include: [
        {
          model: models.acquirerTerminal,
          include: [
            {
              model: models.acquirerTerminalCommon
            }
          ]
        }
      ],
      transaction: t
    })
}

module.exports.newTransaction.findAcquirerConfigOutlet = async (ctx, t) => {
  return models.acquirerConfigOutlet
    .findOne({
      where: {
        acquirerConfigId: ctx.acquirer.acquirerConfigId,
        outletId: ctx.agent.outletId
      },
      transaction: t
    })
}

module.exports.existingTransaction = {}

module.exports.existingTransaction.findTransactionAndFriends = async (ctx, t) => {
  const whereTransaction = {}
  if (ctx.buildOptions.agentId) {
    whereTransaction.agentId = ctx.buildOptions.agentId
  }
  if (!ctx.buildOptions.getLastTransaction) {
    if (ctx.buildOptions.transactionId) {
      whereTransaction.id = ctx.buildOptions.transactionId
    }
    if (ctx.buildOptions.agentOrderReference) {
      whereTransaction.agentOrderReference = ctx.buildOptions.agentOrderReference
    }
    if (Array.isArray(ctx.buildOptions.transactionStatuses)) {
      whereTransaction.status = {
        [Op.in]: ctx.buildOptions.transactionStatuses
      }
    }
  }

  return models.transaction
    .scope('totalRefundAmount')
    .findOne({
      where: whereTransaction,
      order: [
        ['updatedAt', 'DESC'],
        ['createdAt', 'DESC']
      ],
      include: [
        {
          model: models.agent,
          required: true,
          include: [
            {
              model: models.outlet,
              required: true,
              include: [
                {
                  model: models.merchant,
                  required: true
                }
              ]
            }
          ]
        },
        {
          model: models.acquirer,
          required: true,
          include: [
            {
              model: models.acquirerType,
              required: true
            },
            {
              model: models.acquirerConfig,
              required: true
            }
          ]
        },
        {
          model: models.acquirerConfigAgent,
          include: [
            {
              model: models.acquirerTerminal,
              include: [
                {
                  model: models.acquirerTerminalCommon
                }
              ]
            }
          ]
        },
        {
          model: models.acquirerConfigOutlet
        },
        {
          model: models.settleBatchIn
        },
        {
          model: models.settleBatch
        }
      ],
      transaction: t
    })
}

module.exports.existingTransaction.findTransactionRefunds = async (ctx, t) => {
  return models.transactionRefund
    .findAll({
      where: {
        transactionId: ctx.transaction.id
      },
      transaction: t
    })
}

module.exports.settle = {}

module.exports.settle.findSettleBatch = async (ctx, t) => {
  return models.settleBatch.findOne({
    where: {
      id: ctx.buildOptions.settleBatchId,
      status: {
        [Op.ne]: settleBatchStatuses.CLOSED
      }
    },
    include: [
      {
        model: models.agent
      },
      {
        model: models.acquirerConfig
      },
      {
        model: models.acquirerConfigAgent,
        include: [
          {
            model: models.acquirerTerminal,
            include: [
              {
                model: models.acquirerTerminalCommon,
                include: [
                  {
                    model: models.acquirerCompany
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        model: models.acquirerConfigOutlet
      }
    ],
    transaction: t
  })
}

module.exports.settle.findTotalTransactionAmount = async (ctx, t) => {
  return models.transaction
    .scope('totalSuccessAmount')
    .findOne({
      where: {
        settleBatchId: ctx.settleBatch.id
      },
      raw: true,
      transaction: t
    })
}

module.exports.settle.findTotalTransactionAmountByAcquirer = async (ctx, t) => {
  const result = await models.transaction
    .scope('totalSuccessAmount')
    .findAll({
      include: [
        models.acquirer.scope('name')
      ],
      attributes: ['acquirerId'],
      where: {
        settleBatchId: ctx.settleBatch.id
      },
      group: [
        col('acquirer.name'),
        'acquirerId'
      ],
      raw: true,
      transaction: t
    })

  return result.map(val => {
    val.transactionCount = parseInt(val.transactionCount)
    val.name = val['acquirer.name']

    delete val['acquirer.name']
    return val
  })
}
