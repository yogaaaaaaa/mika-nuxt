'use strict'

/**
 * Internal API Route Handler
 */

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const auth = require('../helpers/auth')

const generalController = require('../controllers/generalController')
const agentController = require('../controllers/agentController')
const transactionController = require('../controllers/transactionController')
const paymentProviderController = require('../controllers/paymentProviderController')
const authController = require('../controllers/authController')
const utilitiesController = require('../controllers/utilitiesController')
const terminalController = require('../controllers/terminalController')

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
  authController.loginValidator,
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
  authController.sessionTokenCheckValidator,
  errorMiddleware.validatorErrorHandler,
  authController.sessionTokenCheck
)
router.post('/auth/change_password',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  authController.changePasswordValidator,
  errorMiddleware.validatorErrorHandler,
  authController.changePassword
)

/**
 * General utilities endpoints
 */
router.post('/utilities/emv/bin_check',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get('/utilities/types',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  utilitiesController.listTypes
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
router.post('/resource',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)
router.post('/resources/:resourceId/file',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)

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
  queryMiddleware.paginationToSequelizeValidator('transaction'),
  queryMiddleware.filtersToSequelizeValidator('transaction'),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  errorMiddleware.validatorErrorHandler,
  transactionController.getAgentTransactions
)
router.post('/agent/transaction',
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  cipherboxMiddleware.processCipherbox,
  transactionController.createTransactionValidator,
  errorMiddleware.validatorErrorHandler,
  transactionController.createTransaction
)
router.post('/agent/transaction_follow_up',
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)

/**
 * Merchant Staff related endpoints
 */
router.get('/merchant_staff',
  authMiddleware.auth([auth.userTypes.MERCHANT]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get(['/merchant_staff/transactions', '/merchant/transactions/:id'],
  authMiddleware.auth([auth.userTypes.MERCHANT]),
  authMiddleware.authErrorHandler,
  queryMiddleware.paginationToSequelizeValidator('transaction'),
  queryMiddleware.filtersToSequelizeValidator('transaction'),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  errorMiddleware.validatorErrorHandler,
  transactionController.getMerchantStaffTransactions
)
router.get('/merchant_staff/transactions_statistic',
  authMiddleware.auth([auth.userTypes.MERCHANT]),
  authMiddleware.authErrorHandler,
  queryMiddleware.filtersToSequelize,
  transactionController.getMerchantStaffTransactionsStatistic
)
router.get('/merchant_staff/transactions_time_group',
  authMiddleware.auth([auth.userTypes.MERCHANT]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)

/**
 * Logistic Administration related endpoints
 */
router.get('/logistic/terminals/:terminalId/generate_cbkey',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_LOGISTIC]),
  authMiddleware.authErrorHandler,
  terminalController.generateTerminalCbKeyValidator,
  errorMiddleware.validatorErrorHandler,
  terminalController.generateTerminalCbKey
)

/**
 * Human Resource Administration related endpoints
 */
router.post('/hr/reset_password',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HR]),
  authMiddleware.authErrorHandler,
  authController.resetPasswordValidator,
  errorMiddleware.validatorErrorHandler,
  authController.resetPassword
)

router.use(errorMiddleware.notFoundErrorHandler)
router.use(errorMiddleware.errorHandler)

module.exports = router
