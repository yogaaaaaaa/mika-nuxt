'use strict'

const express = require('express')
const bodyParser = require('body-parser')

const debugController = require('../controllers/debug_controller')
const altoDebugController = require('../controllers/alto_pg_debug_controller')
const midtransDebugController = require('../controllers/midtrans_pg_debug_controller')

const appConfig = require('../config/appConfig')

const router = express.Router()

router.use(bodyParser.json())
router.use((req, res, next) => {
  if (req.headers[appConfig.debugHeader] === appConfig.debugKey) {
    next()
  } else {
    res.status(401).type('text').send('Not Authorized')
  }
})

router.get('/midtrans/transaction', midtransDebugController.queryTransaction)
router.get('/alto/transaction', altoDebugController.queryTransaction)
router.post('/transaction/:transactionId/status/:transactionStatus', debugController.changeTransactionStatus)

router.all('/echo', debugController.echoCipherbox)

module.exports = router
