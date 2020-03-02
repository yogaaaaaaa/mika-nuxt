'use strict'

require('libs/appInit').environmentInit('core')
const isEnvProduction = process.NODE_ENV === 'production'

const morgan = require('morgan')
const serviceBroker = require('libs/serviceBroker')
const express = require('libs/express')
const ready = require('libs/ready')

const keyManagementShellServer = require('shells/keyManagement')

const commonConfig = require('configs/commonConfig')

/**
 * Register core service
 */
serviceBroker.createService(require('services/core'))

/**
 * Core express app
 */
const coreApp = express()

/**
 * Core express app settings and middlewares
 */
coreApp.disable('x-powered-by')
coreApp.set('etag', false)
morgan.token('mika-status', (req, res) => res.msgType && res.msgType.status)
morgan.token('ip-addr', (req, res) => req.headers['x-real-ip'] || req.ip)
coreApp.use(morgan(':method :url :ip-addr :status :mika-status :res[content-length] bytes :response-time ms'))

/**
 * Notification route for acquirer
 */
coreApp.use(require('routes/notifTcash'))
coreApp.use(require('routes/notifAlto'))
coreApp.use(require('routes/notifMidtrans'))
coreApp.use(require('routes/notifTcashQrn'))

/**
 * Debug Route
 */
if (!isEnvProduction) {
  coreApp.use(require('routes/debug'))
}

/**
 * Internal API
 */
coreApp.use(require('routes/api'))

/**
 * Public resources
 */
coreApp.use(require('routes/public'))

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
 * Start listening for Key Management Shell
 */
ready.onReadyAllOnce(() => {
  // Key management Shell is only allowed to run on single instance
  const isClusterZeroOrNone = process.env.NODE_APP_INSTANCE
    ? process.env.NODE_APP_INSTANCE === '0'
    : true
  if (commonConfig.keyManagementShell && isClusterZeroOrNone) {
    keyManagementShellServer.listen(commonConfig.keyManagementShellListenPort,
      () => console.log(`Key Management Shell listening to ${commonConfig.keyManagementShellListenPort}`)
    )
  }
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
