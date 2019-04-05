'use strict'

/**
 * Internal API Route Handler
 */

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { body } = require('express-validator/check')

const auth = require('../helpers/auth')

const generalController = require('../controllers/generalController')
const agentController = require('../controllers/agentController')
const transactionController = require('../controllers/transactionController')
const paymentProviderController = require('../controllers/paymentProviderController')
const authController = require('../controllers/authController')

const cipherboxMiddleware = require('../middleware/cipherboxMiddleware')
const authMiddleware = require('../middleware/authMiddleware')
const errorMiddleware = require('../middleware/errorMiddleware')
const queryMiddleware = require('../middleware/queryMiddleware')

const router = express.Router()

router.use([
  cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200
  }),
  bodyParser.json(),
  cookieParser()
])

/**
 * Auth Routes
 */
router.post('/auth/login',
  cipherboxMiddleware.cipherbox,
  body('username').exists(),
  body('password').exists(),
  errorMiddleware.validatorErrorHandler,
  authController.login
)
router.post('/auth/logout',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  authController.logout
)
router.post('/auth/logout_all',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.post('/auth/check',
  body('sessionToken').exists(),
  errorMiddleware.validatorErrorHandler,
  authController.sessionTokenCheck
)
router.post('/auth/change_password',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  body('oldPassword').exists(),
  body('password').exists(),
  errorMiddleware.validatorErrorHandler,
  authController.changePassword
)
router.post('/auth/reset_password',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  body('userId').exists(),
  body('password').exists(),
  errorMiddleware.validatorErrorHandler,
  authController.resetPassword
)

/**
 * Resource(s) related routes
 */
router.get('/resources/:resourceId/:filesId',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)

/**
 * General utilities routes
 */
router.post('/utilities/emv/bin_check',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get('/utilities/supported_aliases',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get('/utilities/supported_handlers',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get('/utilities/app_version',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)

/**
 * Agent related routes
 */
router.get('/agent',
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  agentController.getAgent
)
router.get([ '/agent/payment_providers', '/agent/payment_providers/:paymentProviderId' ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  paymentProviderController.getAgentPaymentProviders
)
router.get([ '/agent/transactions', '/agent/transactions/:transactionId' ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  transactionController.getAgentTransactions
)
router.post('/agent/transaction',
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  cipherboxMiddleware.cipherbox,
  body('amount').exists().isNumeric(),
  body('paymentProviderId').exists(),
  body('userToken').optional(),
  body('userTokenType').optional().isString(),
  body('locationLong').optional().isLatLong(),
  body('locationLat').optional().isLatLong(),
  body('flags').optional().isArray(),
  errorMiddleware.validatorErrorHandler,
  transactionController.newTransaction
)
router.post('/agent/post_transaction',
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  body('paymentProviderId').exists(),
  body('transactionId').exists(),
  body('postActionUserToken').exists(),
  errorMiddleware.validatorErrorHandler,
  generalController.notImplemented
)

/**
 * Merchant related route
 */
router.get('/merchant',
  authMiddleware.auth([auth.userTypes.MERCHANT]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)

/**
 * Merchant PIC related route
 */
router.get('/merchant_pic',
  authMiddleware.auth([auth.userTypes.MERCHANT]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)

/**
 * Administration related route
 */
router.get([ '/merchants', '/merchants/:merchantId' ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get([ '/merchants/:merchantId/terminals', '/merchants/:merchantId/terminals/:terminalId' ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.post('/merchants/:merchantId/terminals',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.post([ '/terminals', '/terminals/:terminalId' ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.post('/terminals/:terminalId/generate_cbkey',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get([ '/payment_providers', '/payment_providers/:paymentProviderId' ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get(['/view_groups/:viewGroupId/transactions', '/view_groups/:viewGroupId/transactions/:transactionId'],
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.post('/resources/:resourceId',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)

router.use(errorMiddleware.notFoundErrorHandler)
router.use(errorMiddleware.errorHandler)

module.exports = router
