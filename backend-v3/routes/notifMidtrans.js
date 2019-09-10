'use strict'

/**
 * Route to handle midtrans payment gateway notification
 */

const express = require('../libs/express')

const aqMidtransNotifController = require('../controllers/aqMidtransNotifController')
const aqMidtransConfig = require('../configs/aqMidtransConfig')

const router = express.Router()

router.post(aqMidtransConfig.notifEndpoint,
  aqMidtransNotifController.midtransNotifHandleMiddlewares
)

module.exports = router
