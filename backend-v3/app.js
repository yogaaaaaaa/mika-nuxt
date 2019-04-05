'use strict'

process.env.NODE_ENV = 'development' || process.env.NODE_ENV
console.log('Running NODE_ENV', process.env.NODE_ENV)

const express = require('express')
require('express-async-errors')

const ready = require('./helpers/ready')

const path = require('path')
const logger = require('morgan')

const appConfig = require('./config/appConfig')

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
 * Home page
 */
app.get('/', function (req, res, next) {
  res.render('index', { title: `${appConfig.name}` })
})

/**
 * Public resources
 */
app.use(express.static(path.join(__dirname, 'public')))

/**
 * External/Public API
 */
// app.use('/mika', require('./routes/extApi'))

/**
 * Debug Route
 */
// if (process.env.NODE_ENV === 'development') {
//   app.use('/debug', require('./routes/debug'))
// }

/**
 * Internal API
 */
app.use(appConfig.appPrefixPath, require('./routes/api'))

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
ready.readyAllOnce(() => {
  app.listen(appConfig.listenPort, () => {
    console.log(`${appConfig.name} is listening on port ${appConfig.listenPort}`)
  })
})

module.exports = app
