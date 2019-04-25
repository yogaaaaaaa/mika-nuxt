'use strict'

/**
 * Public/External API route handler
*/

const express = require('express')
const bodyParser = require('body-parser')

const router = express.Router()

const extApiAuthMiddleware = require('../middlewares/extApiAuthMiddleware')
const authMiddleware = require('../middlewares/authMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const extApiController = require('../controllers/extApiController')

router.use(bodyParser.json())

router.use(extApiAuthMiddleware.extApiAuth)
router.use(authMiddleware.authErrorHandler)

router.get('/',
  extApiController.getRoot
)
router.post(
  [
    '/transactions',
    '/transaction'
  ],
  extApiController.createTransactionMiddlewares
)
router.get(
  [
    '/transactions',
    '/transactions/:transactionId',
    '/agents/:agentId/transactions',
    '/merchants/:merchantId/transactions'
  ],
  extApiController.getTransactionsMiddlewares
)
router.get(
  [
    '/agents',
    '/agents/:agentId',
    '/merchants/:merchantId/agents'
  ],
  extApiController.getAgentsMiddlewares
)
router.get(
  [
    '/merchants',
    '/merchants/:merchantId'
  ],
  extApiController.getMerchantsMiddlewares
)

/**
 * Debug route for mika public api
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/debug/transaction/:transactionId/status/:transactionStatus',
    extApiController.debugSetTransactionStatus
  )
}

router.use(errorMiddleware.notFoundErrorHandler)
router.use(errorMiddleware.errorHandler)

module.exports = router
