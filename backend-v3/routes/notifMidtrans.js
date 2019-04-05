'use strict'

/**
 * Route to handle midtrans payment gateway notification
 */

const express = require('express')
const bodyParser = require('body-parser')

const ppMidtransNotifController = require('../controllers/ppMidtransNotifController')

const ppMidtransConfig = require('../config/ppMidtransConfig')

const router = express.Router()

router.use(bodyParser.json())

router.post(ppMidtransConfig.notifEndpoint, ppMidtransNotifController.midtransHandleNotification)

module.exports = router
