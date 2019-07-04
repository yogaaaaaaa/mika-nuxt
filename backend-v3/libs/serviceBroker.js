'use strict'

const Moleculer = require('moleculer')

const ready = require('./ready')
ready.addModule('service-broker')

const config = require('../configs/serviceBrokerConfig')

const serviceBroker = new Moleculer.ServiceBroker(config)
serviceBroker
  .start()
  .then(() => {
    ready.ready('service-broker')
  })

module.exports = serviceBroker
