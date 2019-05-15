'use strict'

/**
 * Route to handle alto acquirer notification
 */

const express = require('express')
const bodyParser = require('body-parser')
const ppAltoNotifController = require('../controllers/aqAltoNotifController')
const ppAltoConfig = require('../configs/ppAltoConfig')

const router = express.Router()
router.post(
  ppAltoConfig.notifEndpoint,
  bodyParser.urlencoded({ extended: false }),
  ppAltoNotifController.altoHandleNotification
)

module.exports = router
