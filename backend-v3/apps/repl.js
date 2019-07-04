'use strict'

console.log('Starting moleculer repl apps')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
console.log('NODE_ENV is', process.env.NODE_ENV)

const ready = require('../libs/ready')
const serviceBroker = require('../libs/serviceBroker')

ready.onReadyAllOnce(() => serviceBroker.repl())
