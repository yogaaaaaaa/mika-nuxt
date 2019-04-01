'use strict'

/**
 * Route to handle midtrans payment gateway notification
 */

const express = require('express')
const bodyParser = require('body-parser')

const midtransNotifController = require('../controllers/pgMidtransNotifController')

const midtransPgConfig = require('../config/pgMidtransConfig')

const router = express.Router()
router.use(bodyParser.json())

router.post(midtransPgConfig.notifEndpoint, midtransNotifController.midtransHandleNotification)

module.exports = router
