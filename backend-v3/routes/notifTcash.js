'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const urlBodyParser = bodyParser.urlencoded({ extended: false })
const aqTcashNotifController = require('../controllers/aqTcashNotifController')
const aqTcashConfig = require('../configs/aqTcashConfig')

const router = express.Router()
router.post(aqTcashConfig.inquiryEndpoint,
  urlBodyParser,
  aqTcashNotifController.tcashHandleInquiryAndPay
)
router.post(aqTcashConfig.payEndpoint,
  urlBodyParser,
  aqTcashNotifController.tcashHandleInquiryAndPay
)

module.exports = router
