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

const merchantStaffController = require('../controllers/merchantStaffController')
const outletController = require('../controllers/outletController')
const generalController = require('../controllers/generalController')
const agentController = require('../controllers/agentController')
const transactionController = require('../controllers/transactionController')
const acquirerController = require('../controllers/acquirerController')
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
router.get('/utilities/msg_props',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  utilitiesController.listMsgProps
)
router.get('/utilities/trx_props',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  utilitiesController.listTrxManagerProps
)
router.get('/utilities/auth_props',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  utilitiesController.listAuthProps
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
router.get(
  [
    '/agent/acquirers',
    '/agent/acquirers/:acquirerId'
  ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  acquirerController.getAgentAcquirers
)
router.get(
  [
    '/agent/transactions',
    '/agent/transactions/:transactionId',
    '/agent/transactions/by_alias/:idAlias'
  ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  transactionController.getAgentTransactionsMiddlewares
)
router.post(
  [
    '/agent/transactions',
    '/agent/transaction'
  ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  transactionController.createTransactionMiddlewares
)

/**
 * Merchant Staff related endpoints
 */
router.get('/merchant_staff',
  authMiddleware.auth([auth.userTypes.MERCHANT_STAFF]),
  authMiddleware.authErrorHandler,
  merchantStaffController.getMerchantStaff
)
router.get(
  [
    '/merchant_staff/acquirers',
    '/merchant_staff/acquirers/:acquirerId'
  ],
  authMiddleware.auth([auth.userTypes.MERCHANT_STAFF]),
  authMiddleware.authErrorHandler,
  acquirerController.getMerchantStaffAcquirers
)
router.get(
  [
    '/merchant_staff/outlets',
    '/merchant_staff/outlets/:outletId'
  ],
  authMiddleware.auth([auth.userTypes.MERCHANT_STAFF]),
  authMiddleware.authErrorHandler,
  outletController.getMerchantStaffOutletsMiddlewares
)
router.get(
  [
    '/merchant_staff/agents',
    '/merchant_staff/agents/:agentId',
    '/merchant_staff/outlets/:outletId/agents'
  ],
  authMiddleware.auth([auth.userTypes.MERCHANT_STAFF]),
  authMiddleware.authErrorHandler,
  agentController.getMerchantStaffAgentsMiddlewares
)
router.get(
  [
    '/merchant_staff/transactions',
    '/merchant_staff/transactions/:transactionId',
    '/merchant_staff/outlets/:outletId/transactions'
  ],
  authMiddleware.auth([auth.userTypes.MERCHANT_STAFF]),
  authMiddleware.authErrorHandler,
  transactionController.getMerchantStaffTransactionsMiddlewares
)
router.get(
  [
    '/merchant_staff/statistics/transactions/by_acquirer'
  ],
  authMiddleware.auth([auth.userTypes.MERCHANT_STAFF]),
  authMiddleware.authErrorHandler,
  transactionController.getMerchantStaffAcquirerTransactionStatsMiddlewares
)
router.get(
  [
    '/merchant_staff/statistics/transactions/count_by_time_group'
  ],
  authMiddleware.auth([auth.userTypes.MERCHANT_STAFF]),
  authMiddleware.authErrorHandler,
  transactionController.getMerchantStaffTransactionTimeGroupCountMiddlewares
)

/**
 * Head Administration related endpoints
 */
router.post('/head/admins',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HEAD]),
  authMiddleware.authErrorHandler,
  adminController.createAdminMiddlewares
)
router.get(
  [
    '/head/admins', '/head/admins/:adminId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HEAD]),
  authMiddleware.authErrorHandler,
  adminController.getAdminsMiddlewares
)
router.put('/head/admins/:adminId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HEAD]),
  authMiddleware.authErrorHandler,
  adminController.updateAdminMiddlewares
)
router.delete('/head/admins/:adminId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HEAD]),
  authMiddleware.authErrorHandler,
  adminController.deleteAdmin
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
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_SUPER]),
  authMiddleware.authErrorHandler,
  partnerController.generatePartnerApiKeyMiddlewares
)

router.use(errorMiddleware.notFoundErrorHandler)
router.use(errorMiddleware.errorHandler)

module.exports = router
