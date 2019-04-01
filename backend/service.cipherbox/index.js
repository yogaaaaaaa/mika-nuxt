'use strict'

const Moleculer = require('moleculer')

const broker = new Moleculer.ServiceBroker(require('./config/broker'))

broker.createService(require('./service/cipherbox.service'))
broker.start()
