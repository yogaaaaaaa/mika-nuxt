'use strict'

const { TelnetTerminalServer } = require('libs/serverterm')

const idleTime = 120 * 1000

const server = new TelnetTerminalServer()
server.use(require('libs/serverterm/middlewares/log'))
server.use(require('libs/serverterm/middlewares/terminalKit'))
server.use(require('libs/serverterm/middlewares/terminalKit/key'))
server.use(require('libs/serverterm/middlewares/terminalKit/idle')(idleTime))
server.use(require('libs/serverterm/middlewares/terminalKit/intervalDisplay'))

server.use(require('./authController'))
server.use(require('./commonUi'))
server.use(require('./activites/login'))
server.use(require('./activites/menu'))
server.use(require('./activites/endAndError'))

module.exports = server
