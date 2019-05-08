'use strict'

const msgFactory = require('../helpers/msgFactory')
const trxManager = require('../helpers/trxManager')

const { body } = require('express-validator/check')

const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')
const queryMiddleware = require('../middlewares/queryMiddleware')

const models = require('../models')
const Sequelize = models.Sequelize
const Op = Sequelize.Op

// const script = require('../helpers/script')

/**
 * Validator middleware(s) for createTransaction
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
  try {
    const createTrxResult = await trxManager.create(
      {
        agentId: req.auth.agentId,
        terminalId: req.auth.terminalId,
        amount: req.body.amount,
        paymentProviderId: req.body.paymentProviderId,
        ipAddress: req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip,
        locationLat: req.body.locationLat,
        locationLong: req.body.locationLong,
        userToken: req.body.userToken,
        userTokenType: req.body.userTokenType
      },
      {
        flags: req.body.flags
      }
    )

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
  } catch (err) {
    let msgType = trxManager.errorToMsgTypes(err)
    if (msgType) {
      msgFactory.expressCreateResponse(
        res,
        msgType
      )
    } else {
      console.error(err)
      throw Error('Cannot handle createTransaction error')
    }
  }
}

/**
 * All Middlewares for createTransaction
 */
module.exports.createTransactionMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  module.exports.createTransactionValidator,
  errorMiddleware.validatorErrorHandler,
  module.exports.createTransaction
]

/**
 * Get one or many agent transactions of (via `req.auth.agentId`)
 */
module.exports.getAgentTransactions = async (req, res, next) => {
  let query = {
    where: {
      agentId: req.auth.agentId
    }
  }

  if (Object.keys(req.params).some(key => req.params[key])) {
    if (req.params.transactionId) {
      query.where.id = req.params.transactionId
    }
    if (req.params.idAlias) {
      query.where.idAlias = req.params.idAlias
    }
    let transaction = await models.transaction.scope('agent').findOne(query)
    msgFactory.expressCreateResponse(
      res,
      transaction
        ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : msgFactory.msgTypes.MSG_SUCCESS_SINGLE_ENTITY_NOT_FOUND,
      transaction || undefined
    )
  } else {
    req.applyPaginationSequelize(query)
    req.applyFiltersWhereSequelize(query)
    if (req.query.get_count) {
      let transactions = await models.transaction.scope('agent').findAndCountAll(query)
      msgFactory.expressCreateResponse(
        res,
        transactions.rows.length > 0
          ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
          : msgFactory.msgTypes.MSG_SUCCESS_NO_ENTITY,
        transactions.rows,
        msgFactory.createPaginationMeta(req.query.page, req.query.per_page, transactions.count)
      )
    } else {
      let transactions = await models.transaction.scope('agent').findAll(query)
      msgFactory.expressCreateResponse(
        res,
        transactions.length > 0
          ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
          : msgFactory.msgTypes.MSG_SUCCESS_NO_ENTITY,
        transactions
      )
    }
  }
}

/**
 * All Middlewares for getAgentTransactions
 */
module.exports.getAgentTransactionsMiddlewares = [
  queryMiddleware.paginationToSequelizeValidator('transaction'),
  queryMiddleware
    .filtersToSequelizeValidator(
      [
        'transaction',
        'agent',
        'paymentProvider',
        'paymentProviderType',
        'paymentProviderConfig'
      ]),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  module.exports.getAgentTransactions
]

module.exports.getMerchantStaffTransactionsStatistic = async (req, res, next) => {
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

module.exports.getMerchantStaffTransactionTimeGroup = async (req, res, next) => {
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
