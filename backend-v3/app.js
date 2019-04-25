'use strict'

process.env.NODE_ENV = 'development' || process.env.NODE_ENV
console.log('Running with NODE_ENV', process.env.NODE_ENV)

const express = require('express')
require('express-async-errors')

const ready = require('./helpers/ready')

const path = require('path')
const logger = require('morgan')

const appConfig = require('./configs/appConfig')

/**
 * MIKA app
 */
const app = express()
app.disable('x-powered-by')
app.set('etag', false)

/**
 * Logger middleware
 */
app.use(logger('dev'))

/**
 * Notification route for payment gateway
 */
app.use(require('./routes/notifTcash'))
app.use(require('./routes/notifAlto'))
app.use(require('./routes/notifMidtrans'))

/**
 * Debug Route
 */
if (process.env.NODE_ENV === 'development') {
  app.use('/debug', require('./routes/debug'))
}

/**
 * External/Public API
 */
app.use('/mika', require('./routes/extApi'))

/**
 * Internal API
 */
app.use('/api', require('./routes/api'))

/**
 * Public resources
 */
app.use('/thumbnails', express.static(path.join(__dirname, 'assets', 'images')))

/**
 * Home page
 */
app.get('/', function (req, res, next) {
  res
    .type('text')
    .send(`${appConfig.name}`)
})

/**
 * Global 404 handler
 */
app.use((req, res, next) => {
  res
    .status(404)
    .type('text')
    .send('URL Not Found')
})

/**
 * Global Error handler
 */
app.use((err, req, res, next) => {
  let message = 'Internal Server Error'

  if (err) {
    if (req.app.get('env') === 'development') {
      message = `${message}\n${err.message}`
    }
  }

  res
    .status(500)
    .type('text')
    .send(message)
})

/**
 * Start listening
 */
ready.onReadyAllOnce(() => {
  app.listen(appConfig.httpListenPort, () => {
    console.log(`${appConfig.name} is listening on port ${appConfig.httpListenPort}`)
  })
})

module.exports = app
