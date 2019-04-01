'use strict'

/**
 * Internal API Route Handler
 */

const express = require('express')
const bodyParser = require('body-parser')

const cors = require('cors')

const cookieParser = require('cookie-parser')
const router = express.Router()

const apiErrorMiddleware = require('../middleware/apiErrorMiddleware')

router.use([
  cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200
  }),
  bodyParser.json(),
  bodyParser.urlencoded({ extended: false }),
  cookieParser()
])

// router.use('/auth', require('./auth'))
/*
router.use('/merchant', require('./routes/merchant'))
router.use('/payment_gateway', require('./routes/payment_gateway'))
router.use('/payment_gateway_type', require('./routes/payment_gateway_type'))
router.use('/report', require('./routes/report'))
router.use('/terminal', require('./routes/terminal'))
router.use('/terminal_payment_gateway', require('./routes/terminal_payment_gateway'))
router.use('/transaction', require('./routes/transaction'))
*/

router.use(apiErrorMiddleware.notFoundErrorHandler)
router.use(apiErrorMiddleware.errorHandler)

module.exports = router
