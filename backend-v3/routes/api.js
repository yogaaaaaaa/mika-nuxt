'use strict'

/**
 * Internal API Route Handler
 */

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const auth = require('../helpers/auth')

const appConfig = require('../configs/appConfig')

const generalController = require('../controllers/generalController')
const agentController = require('../controllers/agentController')
const transactionController = require('../controllers/transactionController')
const paymentProviderController = require('../controllers/paymentProviderController')
const authController = require('../controllers/authController')
const utilitiesController = require('../controllers/utilitiesController')
const terminalController = require('../controllers/terminalController')
const partnerController = require('../controllers/partnerController')
const adminController = require('../controllers/adminController')

const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')
const authMiddleware = require('../middlewares/authMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const router = express.Router()

router.use([
  cors({
    origin: appConfig.allowedOrigin,
    optionsSuccessStatus: 200
  }),
  bodyParser.json(),
  cookieParser()
])

/**
 * Hello endpoint
 */
router.all('/',
  cipherboxMiddleware.processCipherbox(),
  authMiddleware.auth(),
  generalController.welcome
)

/**
 * Auth Endpoints
 */
router.post('/auth/login',
  authController.loginMiddlewares
)
router.post('/auth/logout',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  authController.logout
)
router.post('/auth/check',
  authController.sessionTokenCheckMiddlewares
)
router.post('/auth/change_password',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  authController.changePasswordMiddlewares
)

/**
 * General utilities endpoints
 */
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
router.post('/resources',
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
router.get([ '/agent/transactions', '/agent/transactions/:transactionId', '/agent/transactions/by_alias/:idAlias' ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  transactionController.getAgentTransactionsMiddlewares
)
router.post(['/agent/transactions', '/agent/transaction'],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  transactionController.createTransactionMiddlewares
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
  generalController.notImplemented
)
router.get('/merchant_staff/transactions_statistic',
  authMiddleware.auth([auth.userTypes.MERCHANT]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get('/merchant_staff/transactions_time_group',
  authMiddleware.auth([auth.userTypes.MERCHANT]),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)

/**
 * Logistic Administration related endpoints
 */
router.post('/logistic/terminals/:terminalId/generate_key',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_LOGISTIC]),
  authMiddleware.authErrorHandler,
  terminalController.generateTerminalCbKeyMiddlewares
)

/**
 * Marketing Administration related endpoints
 */
router.post('/marketing/partners/:partnerId/generate_apikey',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HR]),
  authMiddleware.authErrorHandler,
  partnerController.generatePartnerApiKeyMiddlewares
)

/**
 * Human Resource Administration related endpoints
 */
router.post('/hr/admins',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HR]),
  authMiddleware.authErrorHandler,
  adminController.createAdminMiddlewares
)
router.get(['/hr/admins', '/hr/admins/:adminId'],
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HR]),
  authMiddleware.authErrorHandler,
  adminController.getAdminsMiddlewares
)
router.put(['/hr/admins/:adminId'],
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HR]),
  authMiddleware.authErrorHandler,
  adminController.updateAdminMiddlewares
)

router.use(errorMiddleware.notFoundErrorHandler)
router.use(errorMiddleware.errorHandler)

module.exports = router
