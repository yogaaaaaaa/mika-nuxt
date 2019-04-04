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

/**
 * Logger middleware
 */
app.use(logger('dev'))

/**
 * View engine
 */
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

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
 * Internal API
 */
app.use(appConfig.appPrefixPath, require('./routes/api'))

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
 * Global error handler
 */
app.use(function (req, res, next) {
  // Forward 404 error to global error handler
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

/**
 * Start listening
 */
ready.readyAllOnce(() => {
  app.listen(appConfig.listenPort, () => {
    console.log(`${appConfig.name} is running on port ${appConfig.listenPort}`)
  })
})

module.exports = app
