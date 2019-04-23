'use strict'

/**
 * Quick and dirty debug route handler
 */

const express = require('express')
const bodyParser = require('body-parser')

const debugController = require('../controllers/debugController')
const altoDebugController = require('../controllers/ppAltoDebugController')
const midtransDebugController = require('../controllers/ppMidtransDebugController')

const authMiddleware = require('../middlewares/authMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const router = express.Router()

router.use(bodyParser.json())
router.use(authMiddleware.debugAuth)
router.use(authMiddleware.authErrorHandler)

router.post('/midtrans/transaction', midtransDebugController.queryTransaction)
router.post('/alto/transaction', altoDebugController.queryTransaction)
router.post('/transaction/:transactionId/status/:transactionStatus', debugController.changeTransactionStatus)
router.all('/echo', debugController.echoCipherbox)

router.use(errorMiddleware.notFoundErrorHandler)
router.use(errorMiddleware.errorHandler)

module.exports = router
