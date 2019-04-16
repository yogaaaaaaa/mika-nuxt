'use strict'

const msgFactory = require('../helpers/msgFactory')
const trxManager = require('../helpers/trxManager')

const { body } = require('express-validator/check')

const models = require('../models')
const Sequelize = models.Sequelize
const Op = Sequelize.Op

// const script = require('../helpers/script')

/**
 * Helper function to do query to many entities and
 * create appropriate express response
 */
async function transactionsQueryAndResponse (req, res, query) {
  if (req.params.transactionId) {
    query.where.id = req.params.transactionId
    let transaction = await models.transaction.findOne(query)

    msgFactory.expressCreateResponse(
      res,
      transaction
        ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND,
      transaction
    )
  } else {
    req.applyPaginationSequelize(query)
    req.applyFiltersWhereSequelize(query)
    let transactions = null
    if (req.query.get_count) {
      transactions = await models.transaction.findAndCountAll(query)
      msgFactory.expressCreateResponse(
        res,
        transactions.rows.length > 0
          ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
          : msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND,
        transactions.rows,
        msgFactory.createPaginationMeta(req.query.page, req.query.per_page, transactions.count)
      )
    } else {
      transactions = await models.transaction.findAll(query)
      msgFactory.expressCreateResponse(
        res,
        transactions.length > 0
          ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
          : msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND,
        transactions
      )
    }
  }
}

/**
 * Validator for createTransaction
 */
module.exports.createTransactionValidator = [
  body('amount').isNumeric(),
  body('paymentProviderId').exists(),
  body('userToken').optional(),
  body('userTokenType').isString().optional(),
  body('locationLong').isNumeric().optional(),
  body('locationLat').isNumeric().optional(),
  body('flags').isArray().optional()
]

/**
 * Create new transaction by agent (via `req.auth.userType`)
 */
module.exports.createTransaction = async (req, res, next) => {
  const createTrxResult = await trxManager.createTransaction(
    {
      amount: req.body.amount,
      paymentProviderId: req.body.paymentProviderId,
      agentId: req.auth.agentId,
      terminalId: req.auth.terminalId,
      ipAddress: req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip,
      locationLat: req.body.locationLat,
      locationLong: req.body.locationLong
    },
    {
      flags: req.body.flags,
      userToken: req.body.userToken,
      userTokenType: req.body.userTokenType
    }
  )

  // translate error message
  if (createTrxResult.error) {
    if (createTrxResult.error === trxManager.errorCodes.AMOUNT_TOO_LOW) {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_AMOUNT_TOO_LOW
      )
    } else if (createTrxResult.error === trxManager.errorCodes.AMOUNT_TOO_HIGH) {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_AMOUNT_TOO_HIGH
      )
    } else if (createTrxResult.error === trxManager.errorCodes.NEED_USER_TOKEN) {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_NEED_USER_TOKEN
      )
    } else if (createTrxResult.error === trxManager.errorCodes.PAYMENT_PROVIDER_NOT_FOR_YOU) {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_PAYMENT_PROVIDER_NOT_FOR_YOU
      )
    } else {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_CANNOT_CREATE_TRANSACTION,
        createTrxResult
      )
    }
    return
  }

  if (createTrxResult.redirectTo) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_TRANSACTION_REDIRECTED,
      createTrxResult
    )
    return
  }

  if (createTrxResult.followUpType) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_TRANSACTION_PENDING_NEED_FOLLOW_UP,
      createTrxResult
    )
    return
  }

  if (createTrxResult.transactionStatus === trxManager.transactionStatuses.SUCCESS) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_TRANSACTION_CREATED_AND_SUCCESS,
      createTrxResult
    )
    return
  }

  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_SUCCESS_TRANSACTION_CREATED,
    createTrxResult
  )
}

/**
 * Get one or many agent transactions of (via `req.auth.agentId`)
 */
module.exports.getAgentTransactions = async (req, res, next) => {
  let query = {
    where: {
      agentId: req.auth.agentId
    },
    attributes: { exclude: ['deletedAt'] },
    include: [
      {
        model: models.paymentProvider,
        attributes: {
          exclude: [
            'shareMerchant',
            'shareMerchantWithPartner',
            'sharePartner',
            'directSettlement',
            'createdAt',
            'updatedAt',
            'deletedAt'
          ]
        },
        include: [
          {
            model: models.paymentProviderType,
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'deletedAt'
              ]
            }
          },
          {
            model: models.paymentProviderConfig,
            attributes: {
              exclude: [
                'config',
                'providerIdReference',
                'providerIdType',
                'createdAt',
                'updatedAt',
                'deletedAt'
              ]
            }
          }
        ]
      }
    ]
  }
  return transactionsQueryAndResponse(req, res, query)
}

/**
 * Get one or many merchant's transactions (via `req.auth.merchantId`)
 */
module.exports.getMerchantTransactions = async (req, res, next) => {
  let query = {
    where: {},
    attributes: { exclude: ['deletedAt'] },
    include: [
      {
        model: models.agent,
        where: {
          merchantId: req.auth.merchantId
        },
        attributes: { exclude: [ 'createdAt', 'updatedAt', 'deletedAt' ] }
      },
      {
        model: models.paymentProvider,
        attributes: { exclude: [
          'shareMerchantWithPartner',
          'sharePartner',
          'hidden',
          'gateway',
          'createdAt',
          'updatedAt',
          'deletedAt'
        ] },
        include: [
          {
            model: models.paymentProviderType,
            attributes: { exclude: [ 'createdAt', 'updatedAt', 'deletedAt' ] }
          },
          {
            model: models.paymentProviderConfig,
            attributes: { exclude: ['config', 'createdAt', 'updatedAt', 'deletedAt'] }
          }
        ]
      }
    ]
  }
  return transactionsQueryAndResponse(req, res, query)
}

module.exports.getMerchantTransactionsStatistic = async (req, res, next) => {
  let query = {
    where: {},
    attributes: [
      'paymentProviderId',
      [Sequelize.literal('SUM(`transaction`.`amount`)'), 'amount'],
      [Sequelize.literal('SUM(`transaction`.`amount` * `paymentProvider`.`shareMerchant`)'), 'nettAmount'],
      [Sequelize.fn('COUNT', Sequelize.col('transaction.id')), 'transactionCount']
    ],
    group: [
      'paymentProviderId'
    ],
    include: [
      {
        model: models.paymentProvider,
        attributes: [
          'id',
          'name',
          'description',
          'shareMerchant',
          'merchantId',
          'paymentProviderTypeId'
        ],
        include: [
          {
            model: models.paymentProviderType,
            attributes: [
              'id',
              'class',
              'name',
              'description',
              'thumbnail',
              'thumbnailGray',
              'chartColor'
            ]
          }
        ],
        where: {
          [Op.or]: [
            {
              merchantId: req.auth.merchantId
            },
            {
              merchantId: null
            }
          ]
        }
      },
      {
        model: models.agent,
        attributes: ['merchantId'],
        where: {
          merchantId: req.auth.merchantId
        }
      }
    ]
  }
  req.applyFiltersWhereSequelize(query)
  let transactionsStatistic = await models.transaction.findAll(query)
  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_SUCCESS,
    transactionsStatistic
  )
}

module.exports.getMerchantTransactionTimeGroup = async (req, res, next) => {
  let query = {
    where: {},
    attributes: [
      req.query.group_field,
      [Sequelize.fn('COUNT', '*'), 'transactionCount']
    ],
    include: [
      {
        model: models.agent,
        attributes: ['merchantId'],
        where: {
          merchantId: req.auth.merchantId
        }
      }
    ],
    group: []
  }
  let transactions = models.transaction.findAll(query)

  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND,
    transactions
  )
}
