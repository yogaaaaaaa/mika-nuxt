'use strict'

const Moleculer = require('moleculer')

const broker = new Moleculer.ServiceBroker(require('./config/brokerConfig'))

broker.start().then(() => broker.repl())
