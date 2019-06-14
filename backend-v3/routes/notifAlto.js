'use strict'

/**
 * Route to handle alto acquirer notification
 */

const express = require('express')
const bodyParser = require('body-parser')
const aqAltoNotifController = require('../controllers/aqAltoNotifController')
const aqAltoConfig = require('../configs/aqAltoConfig')

const router = express.Router()
router.post(
  aqAltoConfig.notifEndpoint,
  bodyParser.urlencoded({ extended: false }),
  aqAltoNotifController.altoHandleNotification
)

module.exports = router
