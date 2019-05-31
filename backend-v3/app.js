'use strict'

process.env.NODE_ENV = (process.env.NODE_ENV || 'development').toLowerCase()
console.log('Running with NODE_ENV', process.env.NODE_ENV)

const express = require('./libs/express')
const ready = require('./libs/ready')

const appConfig = require('./configs/appConfig')

const app = express()
app.disable('x-powered-by')
app.set('etag', false)
// app.use(require('compression'))
app.use(require('morgan')('dev'))

/**
 * Notification route for acquirer
 */
app.use(require('./routes/notifTcash'))
app.use(require('./routes/notifAlto'))
app.use(require('./routes/notifMidtrans'))

/**
 * Debug Route
 */
if (process.env.NODE_ENV === 'development') {
  app.use(require('./routes/debug'))
}

/**
 * External/Public API
 */
// app.use(require('./routes/extApi'))

/**
 * Internal API
 */
app.use(require('./routes/api'))

/**
 * Public resources
 */
app.use(require('./routes/public'))

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
