'use strict'

/**
 * Public/External API route handler
*/

const express = require('express')
const bodyParser = require('body-parser')

const { body } = require('express-validator/check')
const router = express.Router()

const extApiAuthMiddleware = require('../middleware/extApiAuthMiddleware')
const extApiErrorMiddleware = require('../middleware/extApiErrorMiddleware')

const extApiController = require('../controllers/extApiController')

router.use(bodyParser.json())

router.use(extApiAuthMiddleware.apiAuth)
router.use(extApiAuthMiddleware.apiAuthErrorHandler)

router.get('/', extApiController.getRoot)

router.get('/transactions/:transactionId', extApiController.getTransactionById)

router.get('/agents/:agentId/transactions',
  [
    extApiAuthMiddleware.checkIfAgentIdValidInParams,
    extApiAuthMiddleware.invalidAgentIdHandler
  ],
  extApiController.getTransactionsByAgent
)

router.get('/agents/:agentId',
  [
    extApiAuthMiddleware.checkIfAgentIdValidInParams,
    extApiAuthMiddleware.invalidAgentIdHandler
  ],
  extApiController.getAgentsById
)

router.get('/agents', extApiController.getAgents)

router.get('/transactions', extApiController.getTransactions)

router.post('/transaction',
  [
    extApiAuthMiddleware.checkIfAgentIdValidInBody,
    extApiAuthMiddleware.invalidAgentIdHandler,
    body('agentId').exists(),
    body('paymentGatewayId').exists(),
    body('amount').isNumeric(),
    body('webhookUrl').optional().isURL({
      protocols: ['https', 'http'],
      require_tld: false
    }),
    extApiErrorMiddleware.validatorErrorHandler
  ],
  extApiController.postTransaction
)

/**
 * Debug route for mika public api
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/debug/transaction/:transactionId/status/:transactionStatus',
    [
      extApiAuthMiddleware.checkIfTransactionIdValidInParams,
      extApiAuthMiddleware.invalidTransactionIdHandler
    ],
    extApiController.debugSetTransactionStatus
  )
}

router.use(extApiErrorMiddleware.notFoundErrorHandler)
router.use(extApiErrorMiddleware.errorHandler)

module.exports = router
