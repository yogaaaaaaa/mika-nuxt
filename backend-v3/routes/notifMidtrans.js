'use strict'

/**
 * Route to handle midtrans payment gateway notification
 */

const express = require('express')
const bodyParser = require('body-parser')
const ppMidtransNotifController = require('../controllers/ppMidtransNotifController')
const ppMidtransConfig = require('../configs/ppMidtransConfig')
const router = express.Router()

router.post(ppMidtransConfig.notifEndpoint,
  bodyParser.json(),
  ppMidtransNotifController.midtransHandleNotification
)

module.exports = router
