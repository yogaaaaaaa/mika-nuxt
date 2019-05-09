'use strict'

/**
 * Route to handle alto payment provider notification
 */

const express = require('express')
const bodyParser = require('body-parser')
const ppAltoNotifController = require('../controllers/ppAltoNotifController')
const ppAltoConfig = require('../configs/ppAltoConfig')

const router = express.Router()
router.post(
  ppAltoConfig.notifEndpoint,
  bodyParser.urlencoded({ extended: false }),
  ppAltoNotifController.altoHandleNotification
)

module.exports = router
