'use strict'

require('libs/appInit').environmentInit()

const serviceBroker = require('libs/serviceBroker')

/**
 * Register report service
 */
serviceBroker.createService(require('services/report'))
