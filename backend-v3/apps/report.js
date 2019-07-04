'use strict'

console.log('Starting report apps')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
console.log('NODE_ENV is', process.env.NODE_ENV)

const serviceBroker = require('../libs/serviceBroker')

/**
 * Register report service
 */
serviceBroker.createService(require('../services/report'))
