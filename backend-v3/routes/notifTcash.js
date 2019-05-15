'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const urlBodyParser = bodyParser.urlencoded({ extended: false })
const ppTcashNotifController = require('../controllers/aqTcashNotifController')
const ppTcashConfig = require('../configs/ppTcashConfig')

const router = express.Router()
router.post(ppTcashConfig.inquiryEndpoint,
  urlBodyParser,
  ppTcashNotifController.tcashHandleInquiryAndPay
)
router.post(ppTcashConfig.payEndpoint,
  urlBodyParser,
  ppTcashNotifController.tcashHandleInquiryAndPay
)

module.exports = router
