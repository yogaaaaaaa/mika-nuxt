'use strict'

const express = require('../libs/express')
const aqTcashQrnNotifController = require('../controllers/aqTcashQrnNotifController')
const aqTcashQrnConfig = require('../configs/aqTcashQrnConfig')

const router = express.Router()

router.post(aqTcashQrnConfig.payInformEndpoint,
  aqTcashQrnNotifController.tcashQrnHandleInformPayMiddlewares
)

module.exports = router
