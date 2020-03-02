'use strict'

require('libs/appInit').environmentInit('repl')

const ready = require('libs/ready')
const serviceBroker = require('libs/serviceBroker')

ready.onReadyAllOnce(() => serviceBroker.repl())
