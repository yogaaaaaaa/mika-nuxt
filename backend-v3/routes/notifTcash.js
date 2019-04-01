'use strict'
const express = require('express')
const bodyParser = require('body-parser')

const tcashNotifController = require('../controllers/pgTcashNotifController')
const tcashPGConfig = require('../config/pgTcashConfig')

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }))

router.post(tcashPGConfig.inquiryEndpoint, tcashNotifController.tcashHandleInquiryAndPay)
router.post(tcashPGConfig.payEndpoint, tcashNotifController.tcashHandleInquiryAndPay)

module.exports = router
