'use strict'

/**
 * Public/External API route handler
*/

const express = require('express')
const bodyParser = require('body-parser')

const { body } = require('express-validator/check')
const router = express.Router()

const extApiAuthMiddleware = require('../middlewares/extApiAuthMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const extApiController = require('../controllers/extApiController')
const generalController = require('../controllers/generalController')

router.use(bodyParser.json())

router.use(extApiAuthMiddleware.apiAuth)
router.use(extApiAuthMiddleware.apiAuthErrorHandler)

router.get('/',
  extApiController.getRoot
)

router.get('/transactions/:transactionId',
  extApiController.getTransactionById
)
router.get('/agents/:agentId/transactions',
  extApiController.getTransactionsByAgent
)
router.get('/agents/:agentId',
  extApiAuthMiddleware.checkIfAgentIdValidInParams,
  extApiAuthMiddleware.invalidAgentIdHandler,
  extApiController.getAgentsById
)
router.get('/agents',
  extApiController.getAgents
)

router.get('/transactions',
  generalController.notImplemented
)
router.post('/transaction',
  extApiAuthMiddleware.checkIfAgentIdValidInBody,
  extApiAuthMiddleware.invalidAgentIdHandler,
  body('agentId').exists(),
  body('paymentGatewayId').exists(),
  body('amount').isNumeric(),
  body('webhookUrl').optional().isURL({
    protocols: ['https', 'http'],
    require_tld: false
  }),
  errorMiddleware.validatorErrorHandler,
  extApiController.postTransaction
)

/**
 * Debug route for mika public api
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/debug/transaction/:transactionId/status/:transactionStatus',
    extApiAuthMiddleware.checkIfTransactionIdValidInParams,
    extApiAuthMiddleware.invalidTransactionIdHandler,
    extApiController.debugSetTransactionStatus
  )
}

router.use(errorMiddleware.notFoundErrorHandler)
router.use(errorMiddleware.errorHandler)

module.exports = router
