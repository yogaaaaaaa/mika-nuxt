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

const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')
const authMiddleware = require('../middlewares/authMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')
const queryMiddleware = require('../middlewares/queryMiddleware')

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
 * Hello endpoint
 */
router.all('/',
  cipherboxMiddleware.processCipherbox,
  authMiddleware.auth(),
  generalController.welcome
)

/**
 * Auth Endpoints
 */
router.post('/auth/login',
  cipherboxMiddleware.processCipherbox,
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
  body('sessionToken').isString(),
  errorMiddleware.validatorErrorHandler,
  authController.sessionTokenCheck
)
router.post('/auth/change_password',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  body('oldPassword').isString(),
  body('password').isString(),
  errorMiddleware.validatorErrorHandler,
  authController.changePassword
)
router.post('/auth/reset_password',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  body('userId').exists(),
  body('password').isString(),
  errorMiddleware.validatorErrorHandler,
  authController.resetPassword
)

/**
 * Resource(s) related endpoints
 */
router.get('/resources/:resourceId',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)
router.get('/files/:fileId',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)

/**
 * General utilities endpoints
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
 * Agent related endpoints
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
  cipherboxMiddleware.processCipherbox,
  body('amount').isNumeric(),
  body('paymentProviderId').exists(),
  body('userToken').optional(),
  body('userTokenType').isString().optional(),
  body('locationLong').isNumeric().optional(),
  body('locationLat').isNumeric().optional(),
  body('flags').isArray().optional(),
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
 * Merchant related endpoints
 */
router.get('/merchant',
  authMiddleware.auth([auth.userTypes.MERCHANT]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get(['/merchant/transactions', '/merchant/transactions/:id'],
  authMiddleware.auth([auth.userTypes.MERCHANT]),
  authMiddleware.authErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  transactionController.getMerchantTransactions
)
router.get('/merchant/transaction_statistic',
  authMiddleware.auth([auth.userTypes.MERCHANT]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get('/merchant/transaction_time_series',
  authMiddleware.auth([auth.userTypes.MERCHANT]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)

/**
 * Merchant PIC related endpoints
 */
router.get('/merchant_pic',
  authMiddleware.auth([auth.userTypes.MERCHANT_PIC]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get(['/merchant_pic/view_groups/:viewGroupId/transactions', '/view_groups/:viewGroupId/transactions/:transactionId'],
  authMiddleware.auth([auth.userTypes.MERCHANT_PIC]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)

/**
 * Administration related endpoints
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
router.post(['/merchants/:merchantId/terminals'],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.post('/merchants/:merchantId/agents',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)

router.post([ '/terminals', '/terminals/:terminalId' ],
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

router.post('/resource',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)
router.post('/resources/:resourceId/file',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)

router.use(errorMiddleware.notFoundErrorHandler)
router.use(errorMiddleware.errorHandler)

module.exports = router
