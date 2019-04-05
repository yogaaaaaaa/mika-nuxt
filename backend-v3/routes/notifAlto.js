'use strict'

/**
 * Route to handle alto payment provider notification
 */

const express = require('express')
const bodyParser = require('body-parser')

const ppAltoNotifController = require('../controllers/ppAltoNotifController')

const ppAltoConfig = require('../config/ppAltoConfig')

const router = express.Router()

router.use(bodyParser.urlencoded({ extended: false }))

router.post(ppAltoConfig.notifyEndpoint, ppAltoNotifController.altoHandleNotification)

module.exports = router
