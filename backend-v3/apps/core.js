'use strict'

console.log('Starting core apps')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
console.log('NODE_ENV is', process.env.NODE_ENV)

const isEnvProduction = process.NODE_ENV === 'production'

const serviceBroker = require('../libs/serviceBroker')
const express = require('../libs/express')
const ready = require('../libs/ready')
const morgan = require('morgan')
const commonConfig = require('../configs/commonConfig')

/**
 * Register core service
 */
serviceBroker.createService(require('../services/core'))

/**
 * Core express app
 */
const coreApp = express()

/**
 * Core express app settings and middlewares
 */
coreApp.disable('x-powered-by')
coreApp.set('etag', false)
morgan.token('mika-status', (req, res) => res.msgStatus)
morgan.token('ip-addr', (req, res) => req.headers['x-real-ip'] || req.ip)
coreApp.use(morgan(':method :url :ip-addr :status :mika-status :res[content-length] bytes :response-time ms'))

/**
 * Notification route for acquirer
 */
coreApp.use(require('../routes/notifTcash'))
coreApp.use(require('../routes/notifAlto'))
coreApp.use(require('../routes/notifMidtrans'))
coreApp.use(require('../routes/notifTcashQrn'))

/**
 * Debug Route
 */
if (!isEnvProduction) {
  coreApp.use(require('../routes/debug'))
}

/**
 * External/Public API
 * NOTE: Unused
 */
// app.use(require('./routes/extApi'))

/**
 * Internal API
 */
coreApp.use(require('../routes/api'))

/**
 * Public resources
 */
coreApp.use(require('../routes/public'))

/**
 * Home page
 */
coreApp.get('/', function (req, res, next) {
  res
    .type('text')
    .send(`${commonConfig.name}`)
})

/**
 * Global 404 handler
 */
coreApp.use((req, res, next) => {
  res
    .status(404)
    .type('text')
    .send('URL Not Found')
})

/**
 * Global Error handler
 */
coreApp.use((err, req, res, next) => {
  let message = 'Internal Server Error'
  if (err && !isEnvProduction) message = `${message}\n${err.message}`
  res
    .status(500)
    .type('text')
    .send(message)
})

/**
 * Start listening
 */
ready.onReadyAllOnce(() => {
  coreApp.listen(commonConfig.httpListenPort,
    () => console.log(`ALL READY - Core ${commonConfig.name} listening to ${commonConfig.httpListenPort}`)
  )
})

module.exports = coreApp
