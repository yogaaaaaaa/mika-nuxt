'use strict'

/**
 * Internal API Route Handler
 */

const express = require('libs/express')
const bodyParser = require('body-parser')
const cors = require('cors')

const auth = require('libs/auth')
const errorMap = require('libs/errorMap')

const commonConfig = require('configs/commonConfig')
const isEnvProduction = process.env.NODE_ENV === 'production'

const acquirerCompanyController = require('controllers/acquirerCompanyController')
const acquirerConfigAgentController = require('controllers/acquirerConfigAgentController')
const acquirerConfigController = require('controllers/acquirerConfigController')
const acquirerConfigOutletController = require('controllers/acquirerConfigOutletController')
const acquirerController = require('controllers/acquirerController')
const acquirerStaffController = require('controllers/acquirerStaffController')
const acquirerTerminalCommonController = require('controllers/acquirerTerminalCommonController')
const acquirerTerminalController = require('controllers/acquirerTerminalController')
const acquirerTypeController = require('controllers/acquirerTypeController')
const adminController = require('controllers/adminController')
const agentController = require('controllers/agentController')
const aqTerminalBniController = require('controllers/aqTerminalBniController')
const authController = require('controllers/authController')
const cardIinController = require('controllers/cardIinController')
const cardIssuerController = require('controllers/cardIssuerController')
const cardSchemeController = require('controllers/cardSchemeController')
const cardTypeController = require('controllers/cardTypeController')
const generalController = require('controllers/generalController')
const merchantController = require('controllers/merchantController')
const merchantStaffController = require('controllers/merchantStaffController')
const merchantStaffOutletController = require('controllers/merchantStaffOutletController')
const outletController = require('controllers/outletController')
const partnerController = require('controllers/partnerController')
const settleBatchController = require('controllers/settleBatchController')
const terminalController = require('controllers/terminalController')
const terminalModelController = require('controllers/terminalModelController')
const transactionController = require('controllers/transactionController')
const userController = require('controllers/userController')
const fraudDetectionController = require('../controllers/fraudDetectionController')
const utilitiesController = require('controllers/utilitiesController')
const auditController = require('controllers/auditController')

const debugMiddleware = require('middlewares/debugMiddleware')
const authMiddleware = require('middlewares/authMiddleware')
const errorMiddleware = require('middlewares/errorMiddleware')

const router = express.Router()

router.use([
  cors({
    origin: commonConfig.allowedOrigins,
    optionsSuccessStatus: 200
  }),
  bodyParser.json()
])

/**
 * Debug middlewares
 */
if (!isEnvProduction) {
  router.use(debugMiddleware.pathDelay())
  router.use(debugMiddleware.log())
  router.use(debugMiddleware.clientDelay())
}
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
router.post('/auth/change_expired_password',
  authController.changeExpiredPasswordMiddlewares
)
router.post('/auth/self_password_check',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  authController.selfPasswordCheckMiddlewares
)

/**
 * General utilities endpoints
 */
router.get('/utilities/msg_props',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  utilitiesController.listMsgPropsMiddlewares
)
router.get('/utilities/trx_props',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  utilitiesController.listTrxManagerPropsMiddlewares
)
router.get('/utilities/auth_props',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  utilitiesController.listAuthPropsMiddlewares
)
router.get('/utilities/thumbnail_lists',
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  utilitiesController.listThumbnailsMiddlewares
)
router.get(
  [
    '/utilities/card_iins',
    '/utilities/card_iins/:cardIinId'
  ],
  authMiddleware.auth(),
  authMiddleware.authErrorHandler,
  cardIinController.searchCardIinMiddlewares
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
  agentController.getAgentMiddlewares
)

router.get(
  [
    '/agent/acquirers',
    '/agent/acquirers/:acquirerId'
  ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  acquirerController.getAgentAcquirersMiddlewares
)
router.get(
  [
    '/agent/acquirer_types',
    '/agent/acquirer_types/:acquirerTypeId'
  ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  acquirerTypeController.getAgentAcquirerTypesMiddlewares
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
router.get(
  [
    '/agent/settle_batches',
    '/agent/settle_batches/:settleBatchId'
  ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  settleBatchController.getAgentSettleBatchMiddlewares
)
router.post(
  [
    '/agent/settle_batches/:settleBatchId/settle'
  ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  settleBatchController.startAgentSettleMiddlewares
)
router.post(
  [
    '/agent/bulk_settle/'
  ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  settleBatchController.startAgentSettleBulkMiddlewares
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
router.post(
  [
    '/agent/reverse_last_transaction',
    '/agent/cancel_last_transaction',
    '/agent/transactions/:transactionId/reverse',
    '/agent/transactions/:transactionId/cancel',
    '/agent/transactions/:transactionId/reverse',
    '/agent/transactions/:agentOrderReference/reverse_by_aor'
  ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  transactionController.reverseTransactionMiddlewares
)
router.post(
  [
    '/agent/transactions/:transactionId/reverse_void',
    '/agent/transactions/:agentOrderReference/reverse_void_by_aor'
  ],
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  transactionController.reverseVoidTransactionMiddlewares
)
router.post('/agent/transactions/:transactionId/void',
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  transactionController.voidTransactionMiddlewares
)
router.post('/agent/transactions/:transactionId/refund',
  authMiddleware.auth([auth.userTypes.AGENT]),
  authMiddleware.authErrorHandler,
  transactionController.refundTransactionMiddlewares
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
  merchantStaffController.getMerchantStaffMiddlewares
)
router.get(
  [
    '/merchant_staff/acquirers',
    '/merchant_staff/acquirers/:acquirerId'
  ],
  authMiddleware.auth([auth.userTypes.MERCHANT_STAFF]),
  authMiddleware.authErrorHandler,
  acquirerController.getMerchantStaffAcquirersMiddlewares
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
/*
TODO: this route is not working in postgres
router.get(
  [
    '/merchant_staff/statistics/transactions/by_acquirer'
  ],
  authMiddleware.auth([auth.userTypes.MERCHANT_STAFF]),
  authMiddleware.authErrorHandler,
  transactionController.getMerchantStaffAcquirerTransactionStatsMiddlewares
)
*/
/*
TODO: this route is not working in postgres
router.get(
  [
    '/merchant_staff/statistics/transactions/count_by_time_group'
  ],
  authMiddleware.auth([auth.userTypes.MERCHANT_STAFF]),
  authMiddleware.authErrorHandler,
  transactionController.getMerchantStaffTransactionTimeGroupCountMiddlewares
)
*/

/**
 * Acquirer Staff related endpoints
 */

router.get(
  '/acquirer_staff',
  authMiddleware.auth([auth.userTypes.ACQUIRER_STAFF]),
  authMiddleware.authErrorHandler,
  acquirerStaffController.getAcquirerStaffMiddlewares
)
router.get(
  [
    '/acquirer_staff/transactions',
    '/acquirer_staff/transactions/:transactionId'
  ],
  authMiddleware.auth([auth.userTypes.ACQUIRER_STAFF]),
  authMiddleware.authErrorHandler,
  transactionController.getAcquirerStaffTransactionsMiddlewares
)
router.get(
  [
    '/acquirer_staff/agents',
    '/acquirer_staff/agents/:agentId'
  ],
  authMiddleware.auth([auth.userTypes.ACQUIRER_STAFF]),
  authMiddleware.authErrorHandler,
  agentController.getAcquirerStaffAgentsMiddlewares
)
router.get(
  [
    '/acquirer_staff/outlets',
    '/acquirer_staff/outlets/:outletId'
  ],
  authMiddleware.auth([auth.userTypes.ACQUIRER_STAFF]),
  authMiddleware.authErrorHandler,
  outletController.getAcquirerStaffOutletsMiddlewares
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
  adminController.getAdminMiddlewares
)

/**
 * Users entity
 */
router.post('/back_office/users/:userId/check_password',
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  userController.checkUserPasswordMiddlewares
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
  adminController.deleteAdminMiddlewares
)
router.post('/back_office/admins/:adminId/reset_password',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HEAD]),
  authMiddleware.authErrorHandler,
  adminController.resetAdminPasswordMiddlewares
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
  agentController.deleteAgentMiddlewares
)
router.post('/back_office/agents/:agentId/reset_password',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HEAD]),
  authMiddleware.authErrorHandler,
  agentController.resetAgentPasswordMiddlewares
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
  merchantStaffController.deleteMerchantStaffMiddlewares
)
router.post('/back_office/merchant_staffs/:merchantStaffId/reset_password',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HEAD]),
  authMiddleware.authErrorHandler,
  merchantStaffController.resetMerchantStaffPasswordMiddlewares
)

/**
 * Acquirer Staff entity
 */
router.get(
  [
    '/back_office/acquirer_staffs',
    '/back_office/acquirer_staffs/:acquirerStaffId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  acquirerStaffController.getAcquirerStaffsMiddlewares
)
router.post(
  '/back_office/acquirer_staffs',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerStaffController.createAcquirerStaffMiddlewares
)
router.put(
  '/back_office/acquirer_staffs/:acquirerStaffId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerStaffController.updateAcquirerStaffMiddlewares
)
router.delete(
  '/back_office/acquirer_staffs/:acquirerStaffId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerStaffController.deleteAcquirerStaffMiddlewares
)
router.post(
  '/back_office/acquirer_staffs/:acquirerStaffId/reset_password',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_HEAD]),
  authMiddleware.authErrorHandler,
  acquirerStaffController.resetAcquirerStaffPasswordMiddlewares
)

/**
 * Acquirer Companies entity
 */
router.get(
  [
    '/back_office/acquirer_companies',
    '/back_office/acquirer_companies/:acquirerCompanyId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN, auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerCompanyController.getAcquirerCompaniesMiddlewares
)
router.post(
  '/back_office/acquirer_companies',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerCompanyController.createAcquirerCompanyMiddlewares
)
router.put(
  '/back_office/acquirer_companies/:acquirerCompanyId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerCompanyController.updateAcquirerCompanyMiddlewares
)
router.delete(
  '/back_office/acquirer_companies/:acquirerCompanyId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerCompanyController.deleteAcquirerCompanyMiddlewares
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
 * Acquirer Config Agent entity
 */
router.get(
  [
    '/back_office/acquirer_config_agents',
    '/back_office/acquirer_config_agents/:acquirerConfigAgentId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  acquirerConfigAgentController.getAcquirerConfigAgentsMiddlewares
)
router.get('/back_office/acquirer_configs/:acquirerConfigId/agents_without_acquirer_config_agent',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  agentController.getAgentsWithoutAcquirerConfigMiddlewares
)
router.post('/back_office/acquirer_config_agents',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerConfigAgentController.createAcquirerConfigAgentMiddlewares
)
router.put('/back_office/acquirer_config_agents/:acquirerConfigAgentId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerConfigAgentController.updateAcquirerConfigAgentMiddlewares
)
router.delete('/back_office/acquirer_config_agents/:acquirerConfigAgentId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerConfigAgentController.deleteAcquirerConfigAgentMiddlewares
)

/**
 * Acquirer Config Outlet entity
 */
router.get(
  [
    '/back_office/acquirer_config_outlets',
    '/back_office/acquirer_config_outlets/:acquirerConfigOutletId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  acquirerConfigOutletController.getAcquirerConfigOutletsMiddlewares
)
router.get('/back_office/acquirer_configs/:acquirerConfigId/outlets_without_acquirer_config_outlet',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  outletController.getOutletsWithoutAcquirerConfigMiddlewares
)
router.post('/back_office/acquirer_config_outlets',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerConfigOutletController.createAcquirerConfigOutletMiddlewares
)
router.put('/back_office/acquirer_config_outlets/:acquirerConfigOutletId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerConfigOutletController.updateAcquirerConfigOutletMiddlewares
)
router.delete('/back_office/acquirer_config_outlets/:acquirerConfigOutletId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerConfigOutletController.deleteAcquirerConfigOutletMiddlewares
)

/**
 * Acquirer Terminal Common entity
 */
router.get(
  [
    '/back_office/acquirer_terminal_commons',
    '/back_office/acquirer_terminal_commons/:acquirerTerminalCommonId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  acquirerTerminalCommonController.getAcquirerTerminalCommonsMiddlewares
)
router.post('/back_office/acquirer_terminal_commons',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerTerminalCommonController.createAcquirerTerminalCommonMiddlewares
)
router.put('/back_office/acquirer_terminal_commons/:acquirerTerminalCommonId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerTerminalCommonController.updateAcquirerTerminalCommonMiddlewares
)
router.delete('/back_office/acquirer_terminal_commons/:acquirerTerminalCommonId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerTerminalCommonController.deleteAcquirerTerminalCommonMiddlewares
)

/**
 * Acquirer Terminal entity
 */
router.get(
  [
    '/back_office/acquirer_terminals',
    '/back_office/acquirer_terminals/:acquirerTerminalId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  acquirerTerminalController.getAcquirerTerminalsMiddlewares
)
router.post('/back_office/acquirer_terminals',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerTerminalController.createAcquirerTerminalMiddlewares
)
router.put('/back_office/acquirer_terminals/:acquirerTerminalId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerTerminalController.updateAcquirerTerminalMiddlewares
)
router.delete('/back_office/acquirer_terminals/:acquirerTerminalId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  acquirerTerminalController.deleteAcquirerTerminalMiddlewares
)

/**
 * Acquirer terminal - terminalBni handler
 */
router.post('/back_office/acquirer_terminals/:acquirerTerminalId/terminal_bni/download_encrypted_ltmk',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING, auth.userRoles.ADMIN_SUPPORT]),
  authMiddleware.authErrorHandler,
  aqTerminalBniController.downloadEncryptedLtmkMiddlewares
)
router.post('/back_office/acquirer_terminals/:acquirerTerminalId/terminal_bni/save_ltmk',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING, auth.userRoles.ADMIN_SUPPORT]),
  authMiddleware.authErrorHandler,
  aqTerminalBniController.saveLtmkMiddlewares
)
router.post('/back_office/acquirer_terminals/:acquirerTerminalId/terminal_bni/download_ltwk',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING, auth.userRoles.ADMIN_SUPPORT]),
  authMiddleware.authErrorHandler,
  aqTerminalBniController.downloadLtwkMiddlewares
)
router.post('/back_office/acquirer_terminals/:acquirerTerminalId/terminal_bni/download_terminal_key',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING, auth.userRoles.ADMIN_SUPPORT]),
  authMiddleware.authErrorHandler,
  aqTerminalBniController.downloadTerminalKeyMiddlewares
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
 * Settle Batch
 */
router.get(
  [
    '/back_office/settle_batches',
    '/back_office/settle_batches:transactionId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  settleBatchController.getSettleBatchMiddlewares
)

/**
 * Partner entity
 */
router.get(
  [
    '/back_office/partners',
    '/back_office/partners/:partnerId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN, auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  partnerController.getPartnersMiddlewares
)
router.post(
  '/back_office/partners',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  partnerController.createPartnerMiddlewares
)
router.put(
  '/back_office/partners/:partnerId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  partnerController.updatePartnerMiddlewares
)
router.delete(
  '/back_office/partners/:partnerId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  partnerController.deletePartnerMiddlewares
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
router.post('/back_office/terminals',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_LOGISTIC]),
  authMiddleware.authErrorHandler,
  terminalController.createTerminalMiddlewares
)
router.post('/back_office/terminals/:terminalId/generate_key',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_LOGISTIC]),
  authMiddleware.authErrorHandler,
  terminalController.generateTerminalCbKeyMiddlewares
)
router.put('/back_office/terminals/:terminalId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_LOGISTIC]),
  authMiddleware.authErrorHandler,
  terminalController.updateTerminalMiddlewares
)
router.delete('/back_office/terminals/:terminalId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_LOGISTIC]),
  authMiddleware.authErrorHandler,
  terminalController.deleteTerminalMiddlewares
)

/**
 * Card Type entity
 */

router.get(
  [
    '/back_office/card_types',
    '/back_office/card_types/:cardTypeId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardTypeController.getCardTypesMiddlewares
)
router.post('/back_office/card_types',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardTypeController.createCardTypeMiddlewares
)
router.put('/back_office/card_types/:cardTypeId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardTypeController.updateCardTypeMiddlewares
)
router.delete('/back_office/card_types/:cardTypeId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardTypeController.deleteCardTypeMiddlewares
)

/**
 * Card Issuer entity
 */

router.get(
  [
    '/back_office/card_issuers',
    '/back_office/card_issuers/:cardIssuerId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardIssuerController.getCardIssuersMiddlewares
)
router.post('/back_office/card_issuers',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardIssuerController.createCardIssuerMiddlewares
)
router.put('/back_office/card_issuers/:cardIssuerId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardIssuerController.updateCardIssuerMiddlewares
)
router.delete('/back_office/card_issuers/:cardIssuerId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardIssuerController.deleteCardIssuerMiddlewares
)

/**
 * Card Scheme entity
 */

router.get(
  [
    '/back_office/card_schemes',
    '/back_office/card_schemes/:cardSchemeId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardSchemeController.getCardSchemesMiddlewares
)
router.post('/back_office/card_schemes',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardSchemeController.createCardSchemeMiddlewares
)
router.put('/back_office/card_schemes/:cardSchemeId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardSchemeController.updateCardSchemeMiddlewares
)
router.delete('/back_office/card_schemes/:cardSchemeId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardSchemeController.deleteCardSchemeMiddlewares
)

/**
 * Card IIN entity
 */

router.get(
  [
    '/back_office/card_iins',
    '/back_office/card_iins/:cardIinId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardIinController.getCardIinsMiddlewares
)
router.post('/back_office/card_iins',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardIinController.createCardIinMiddlewares
)
router.put('/back_office/card_iins/:cardIinId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardIinController.updateCardIinMiddlewares
)
router.delete('/back_office/card_iins/:cardIinId',
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  cardIinController.deleteCardIinMiddlewares
)

/**
 * Fraud Detection
 */
router.get(
  [
    '/back_office/fraud_detection/merchant_rules',
    '/back_office/fraud_detection/merchant_rules/:merchantId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  fraudDetectionController.getMerchantRules
)
router.post(
  [
    '/back_office/fraud_detection/merchant_rules'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  fraudDetectionController.createMerchantRuleMiddlewares
)
router.put(
  [
    '/back_office/fraud_detection/merchant_rules/:merchantId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  fraudDetectionController.updateMerchantRuleMiddlewares
)
router.delete(
  [
    '/back_office/fraud_detection/merchant_rules/:merchantId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN], [auth.userRoles.ADMIN_MARKETING]),
  authMiddleware.authErrorHandler,
  fraudDetectionController.destroyMerchantRule
)

/**
 * Audit Log
 */
router.get(
  [
    '/back_office/audits',
    '/back_office/audits/:auditId'
  ],
  authMiddleware.auth([auth.userTypes.ADMIN]),
  authMiddleware.authErrorHandler,
  auditController.getAuditsMiddlewares
)

router.use(errorMiddleware.notFoundErrorHandler)
router.use(errorMiddleware.errorHandler(errorMap))

const apiRouter = express.Router()
apiRouter.use('/api', router)

module.exports = apiRouter
