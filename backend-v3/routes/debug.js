'use strict'

/**
 * Quick and dirty debug route handler
 */

const express = require('../libs/express')
const bodyParser = require('body-parser')

const debugController = require('../controllers/debugController')
const altoDebugController = require('../controllers/aqAltoDebugController')
const midtransDebugController = require('../controllers/aqMidtransDebugController')

const authMiddleware = require('../middlewares/authMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const router = express.Router()

router.use(bodyParser.json())
router.use(authMiddleware.debugAuth)
router.use(authMiddleware.authErrorHandler)

router.all('/error', debugController.generateError)

router.all('/echo', debugController.echoMiddlewares)

router.post('/transaction/change_status', debugController.changeStatusTransactionMiddlewares)

router.post('/midtrans/query_transaction', midtransDebugController.queryTransactionMiddlewares)

router.post('/alto/query_transaction', altoDebugController.queryTransactionMiddlewares)

router.post('/user/change_password_policy_follow', debugController.changePasswordPolicyFollowMiddlewares)
router.post('/user/change_password_policy_state', debugController.changePasswordPolicyStateMiddlewares)

router.use(errorMiddleware.notFoundErrorHandler)
router.use(errorMiddleware.errorHandler())

const debugRouter = express.Router()
debugRouter.use('/debug', router)
module.exports = debugRouter
