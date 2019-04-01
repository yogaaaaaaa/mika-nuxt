'use strict'

const express = require('express')
const intApiAuthController = require('../controllers/intApiAuthController')

const apiErrorMiddleware = require('../middleware/apiErrorMiddleware')

const { body } = require('express-validator/check')

const router = express.Router()

router.post('/',
  [
    body('username').exists(),
    body('password').exists(),
    apiErrorMiddleware.validatorErrorHandler
  ],
  intApiAuthController.auth)

module.exports = router
