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

router.all('/echo', debugController.echo)
router.post('/transaction/:transactionId/status/:transactionStatus', debugController.changeTransactionStatus)
router.post('/midtrans/transaction', midtransDebugController.queryTransaction)
router.post('/alto/transaction', altoDebugController.queryTransaction)

router.use(errorMiddleware.notFoundErrorHandler)
router.use(errorMiddleware.errorHandler)

const debugRouter = express.Router()
debugRouter.use('/debug', router)
module.exports = debugRouter
