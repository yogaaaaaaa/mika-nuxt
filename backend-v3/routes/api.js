'use strict'

/**
 * Internal API Route Handler
 */

const express = require('../libs/express')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const auth = require('../libs/auth')

const commonConfig = require('../configs/commonConfig')
const isEnvProduction = process.env.NODE_ENV === 'production'

const acquirerConfigController = require('../controllers/acquirerConfigController')
const acquirerController = require('../controllers/acquirerController')
const acquirerTypeController = require('../controllers/acquirerTypeController')
const adminController = require('../controllers/adminController')
const agentController = require('../controllers/agentController')
const authController = require('../controllers/authController')
const generalController = require('../controllers/generalController')
const merchantController = require('../controllers/merchantController')
const merchantStaffController = require('../controllers/merchantStaffController')
const outletController = require('../controllers/outletController')
const partnerController = require('../controllers/partnerController')
const terminalController = require('../controllers/terminalController')
const terminalModelController = require('../controllers/terminalModelController')
const transactionController = require('../controllers/transactionController')
const utilitiesController = require('../controllers/utilitiesController')
const merchantStaffOutletController = require('../controllers/merchantStaffOutletController')

const authMiddleware = require('../middlewares/authMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const router = express.Router()

router.use([
  cors({
    origin: commonConfig.allowedOrigin,
    optionsSuccessStatus: 200
  }),
  bodyParser.json(),
  cookieParser()
])

/**
 * Hello endpoint
 */
router.all('/', generalController.welcome)

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
router.get('/utilities/thumbnail_lists',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  utilitiesController.listThumbnails
)

/**
 * File resource(s) related endpoints
 */
router.post('/resources/:resourceId/files',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get('/resources/:resourceId/files',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.delete('/resources/:resourceId/files',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  generalController.notImplemented
)
router.get('/files/:fileId',
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
 * Debug endpoint for agent
 */

if (!isEnvProduction) {
  router.post(
    [
      '/agent/debug/change_transaction_status'
    ],
    authMiddleware.auth([auth.userTypes.AGENT]),
    authMiddleware.authErrorHandler,
    transactionController.changeAgentTransactionStatusMiddlewares
  )
}

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
 * Collection of Back-office Endpoint
 */

/**
 * Get current logged admin
 */
router.get('/back_office/admin',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  adminController.getAdmin
)

/**
 * Admin entity
 */
router.get(
  [
    '/back_office/admins',
    '/back_office/admins/:adminId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  adminController.getAdminsMiddlewares
)
router.post('/back_office/admins',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HEAD]),
  authMiddleware.authErrorHandler,
  adminController.createAdminMiddlewares
)
router.put('/back_office/admins/:adminId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HEAD]),
  authMiddleware.authErrorHandler,
  adminController.updateAdminMiddlewares
)
router.delete('/back_office/admins/:adminId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HEAD]),
  authMiddleware.authErrorHandler,
  adminController.deleteAdmin
)

/**
 * Merchant entity
 */
router.get(
  [
    '/back_office/merchants',
    '/back_office/merchants/:merchantId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  merchantController.getMerchantsMiddlewares
)
router.post('/back_office/merchants',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  merchantController.createMerchantMiddlewares
)
router.put('/back_office/merchants/:merchantId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  merchantController.updateMerchantMiddlewares
)

/**
 * Outlet entity
 */
router.get(
  [
    '/back_office/outlets',
    '/back_office/outlets/:outletId',
    '/back_office/merchant_staffs/:merchantStaffId/outlets',
    '/back_office/merchant_staffs/:excludeMerchantStaffId/unassociated_outlets'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  outletController.getOutletsMiddlewares
)
router.post('/back_office/outlets',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  outletController.createOutletMiddlewares
)
router.put('/back_office/outlets/:outletId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  outletController.updateOutletMiddlewares
)
router.post('/back_office/merchant_staffs/:merchantStaffId/associate_outlets',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  merchantStaffOutletController.associateOutletsMiddlewares
)
router.post('/back_office/merchant_staffs/:merchantStaffId/dissociate_outlets',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  merchantStaffOutletController.dissociateOutletsMiddlewares
)

/**
 * Agent entity
 */
router.get(
  [
    '/back_office/agents',
    '/back_office/agents/:agentId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  agentController.getAgentsMiddlewares
)
router.post('/back_office/agents',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  agentController.createAgentMiddlewares
)
router.put('/back_office/agents/:agentId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  agentController.updateAgentMiddlewares
)
router.delete('/back_office/agents/:agentId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  agentController.deleteAgent
)

/**
 * Merchant Staff entity
 */
router.get(
  [
    '/back_office/merchant_staffs',
    '/back_office/merchant_staffs/:merchantStaffId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  merchantStaffController.getMerchantStaffsMiddlewares
)
router.post('/back_office/merchant_staffs',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  merchantStaffController.createMerchantStaffMiddlewares
)
router.put('/back_office/merchant_staffs/:merchantStaffId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  merchantStaffController.updateMerchantStaffMiddlewares
)
router.delete('/back_office/merchant_staffs/:merchantStaffId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  merchantStaffController.deleteMerchantStaff
)

/**
 * Acquirer entity
 */
router.get(
  [
    '/back_office/acquirers',
    '/back_office/acquirers/:acquirerId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  acquirerController.getAcquirersMiddlewares
)
router.post('/back_office/acquirers',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerController.createAcquirerMiddlewares
)
router.put('/back_office/acquirers/:acquirerId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerController.updateAcquirerMiddlewares
)
router.delete('/back_office/acquirers/:acquirerId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerController.deleteAcquirerMiddlewares
)

/**
 * Acquirer Type entity
 */
router.get(
  [
    '/back_office/acquirer_types',
    '/back_office/acquirer_types/:acquirerTypeId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  acquirerTypeController.getAcquirerTypesMiddlewares
)
router.post('/back_office/acquirer_types',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerTypeController.createAcquirerTypeMiddlewares
)
router.put('/back_office/acquirer_types/:acquirerTypeId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerTypeController.updateAcquirerTypeMiddlewares
)
router.delete('/back_office/acquirer_types/:acquirerTypeId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerTypeController.deleteAcquirerTypeMiddlewares
)

/**
 * Acquirer Config entity
 */
router.get(
  [
    '/back_office/acquirer_configs',
    '/back_office/acquirer_configs/:acquirerConfigId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  acquirerConfigController.getAcquirerConfigsMiddlewares
)
router.post('/back_office/acquirer_configs',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerConfigController.createAcquirerConfigMiddlewares
)
router.put('/back_office/acquirer_configs/:acquirerConfigId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerConfigController.updateAcquirerConfigMiddlewares
)
router.delete('/back_office/acquirer_configs/:acquirerConfigId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerConfigController.deleteAcquirerConfigMiddlewares
)

/**
 * Transaction entity
 */
router.get(
  [
    '/back_office/transactions',
    '/back_office/transactions/:transactionId',
    '/back_office/transactions/by_alias/:idAlias'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  transactionController.getTransactionsMiddlewares
)

/**
 * Partner entity
 */
router.post('/back_office/partners/:partnerId/api',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  partnerController.generatePartnerApiKeyMiddlewares
)

/**
 * Terminal Model Entity
 */
router.get(
  [
    '/back_office/terminal_models',
    '/back_office/terminal_models/:terminalModelId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  terminalModelController.getTerminalModelsMiddlewares
)
router.post('/back_office/terminal_models',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_LOGISTIC]),
  authMiddleware.authErrorHandler,
  terminalModelController.createTerminalModelMiddlewares
)
router.put('/back_office/terminal_models/:terminalModelId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_LOGISTIC]),
  authMiddleware.authErrorHandler,
  terminalModelController.updateTerminalModelMiddlewares
)
router.delete('/back_office/terminal_models/:terminalModelId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_LOGISTIC]),
  authMiddleware.authErrorHandler,
  terminalModelController.deleteTerminalModelMiddlewares
)

/**
 * Terminal entity
 */
router.get(
  [
    '/back_office/terminal',
    '/back_office/terminal/:terminalId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  terminalController.getTerminalsMiddlewares
)
router.post('/back_office/terminal',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_LOGISTIC]),
  authMiddleware.authErrorHandler,
  terminalController.createTerminalMiddlewares
)
router.post('/back_office/terminals/:terminalId/generate_key',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_LOGISTIC]),
  authMiddleware.authErrorHandler,
  terminalController.generateTerminalCbKeyMiddlewares
)
router.put('/back_office/terminal/:terminalId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_LOGISTIC]),
  authMiddleware.authErrorHandler,
  terminalController.updateTerminalMiddlewares
)
router.delete('/back_office/terminal/:terminalId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_LOGISTIC]),
  authMiddleware.authErrorHandler,
  terminalController.deleteTerminalMiddlewares
)

router.use(errorMiddleware.notFoundErrorHandler)
router.use(errorMiddleware.errorHandler)

const apiRouter = express.Router()
apiRouter.use('/api', router)
module.exports = apiRouter
