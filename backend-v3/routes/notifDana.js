'use strict'

/**
 * Route to handle Dana payment gateway notification
 */

const express = require('libs/express')

const aqDanaNotifController = require('controllers/aqDanaNotifController')
const config = require('configs/aqDanaConfig')
const router = express.Router()

router.post(
  config.danaMikaNotifEndpoint,
  aqDanaNotifController.danaNotifHandleMiddlewares
)
module.exports = router
