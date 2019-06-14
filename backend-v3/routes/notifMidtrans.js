'use strict'

/**
 * Route to handle midtrans payment gateway notification
 */

const express = require('express')
const bodyParser = require('body-parser')
const aqMidtransNotifController = require('../controllers/aqMidtransNotifController')
const aqMidtransConfig = require('../configs/aqMidtransConfig')
const router = express.Router()

router.post(aqMidtransConfig.notifEndpoint,
  bodyParser.json(),
  aqMidtransNotifController.midtransHandleNotification
)

module.exports = router
