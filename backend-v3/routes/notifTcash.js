'use strict'

const express = require('express')
const bodyParser = require('body-parser')

const ppTcashNotifController = require('../controllers/ppTcashNotifController')
const ppTcashConfig = require('../config/ppTcashConfig')

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }))

router.post(ppTcashConfig.inquiryEndpoint, ppTcashNotifController.tcashHandleInquiryAndPay)
router.post(ppTcashConfig.payEndpoint, ppTcashNotifController.tcashHandleInquiryAndPay)

module.exports = router
