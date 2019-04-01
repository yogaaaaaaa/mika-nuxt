'use strict'

/**
 * Route to handle alto payment gateway notification
 */

const express = require('express')
const bodyParser = require('body-parser')

const altoNotifController = require('../controllers/pgAltoNotifController')

const altoPGConfig = require('../config/altoPGConfig')

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }))

router.post(altoPGConfig.notifyEndpoint, altoNotifController.altoHandleNotification)

module.exports = router
