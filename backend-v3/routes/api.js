'use strict'

/**
 * Internal API Route Handler
 */

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const router = express.Router()
const { body } = require('express-validator/check')

const auth = require('../helpers/auth')

const generalController = require('../controllers/generalController')
const transactionController = require('../controllers/transactionController')
const paymentProviderController = require('../controllers/paymentProviderController')
const authController = require('../controllers/authController')

const authMiddleware = require('../middleware/authMiddleware')
const errorMiddleware = require('../middleware/errorMiddleware')
const queryMiddleware = require('../middleware/queryMiddleware')

router.use([
  cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200
  }),
  bodyParser.json(),
  bodyParser.urlencoded({ extended: false }),
  cookieParser()
])

router.post('/auth',
  body('username').exists(),
  body('password').exists(),
  errorMiddleware.validatorErrorHandler,
  authController.auth
)

router.post('/resources/:resourceId',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)

router.get('/resources/:resourceId/:filesId',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)

router.post('/utilities/bin_check',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)

router.get('/terminal',
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)

router.get('/agent',
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)

router.get([ '/agent/payment_providers', '/agent/payment_providers/:id' ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  paymentProviderController.getAgentPaymentProviders)

router.get([ '/agent/payment_providers', '/agent/payment_providers/:id' ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  paymentProviderController.getAgentPaymentProviders)

router.get([ '/agent/transactions', '/agent/transactions/:id' ],
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  queryMiddleware.sequelizePagination,
  transactionController.getTransactions)

router.post('/agent/transaction',
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  body('amount').exists(),
  body('paymentProviderId').exists(),
  body('userToken').optional({ default: null }),
  body('userTokenType').optional({ default: null }),
  body('locationLong').optional({ default: null }),
  body('locationLat').optional({ default: null }),
  body('flags').optional({ default: [] }),
  errorMiddleware.validatorErrorHandler,
  transactionController.newTransaction)

router.post('/agent/post_transaction',
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  body('paymentProviderId').exists(),
  body('transactionId').exists(),
  body('postActionUserToken').exists(),
  errorMiddleware.validatorErrorHandler,
  generalController.notImplemented)

router.get('/merchant',
  authMiddleware.auth([auth.userTypes.MERCHANT]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)

/**
 * Administration related route
 */

router.get([ '/merchants', '/merchants/:id' ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)

router.get('/payment_providers',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)

router.post('/payment_providers',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)

router.get('/view_groups/:viewGroupId/transactions/:id',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented)

router.all('/terminals', generalController.notImplemented)

router.use(errorMiddleware.notFoundErrorHandler)
router.use(errorMiddleware.errorHandler)

module.exports = router
