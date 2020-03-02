'use strict'

const { Server } = require('net')
const BaseTerminalServerMixin = require('./BaseTerminalServerMixin')
const TelnetTerminalSession = require('./TelnetTerminalSession')

class TelnetTerminalServer extends BaseTerminalServerMixin(Server) {
  constructor (options) {
    super(options)
    this.on('connection', (socket) => {
      const ctx = new TelnetTerminalSession({
        terminalServer: this,
        upstream: socket
      })
      ctx.begin()
    })
  }
}

module.exports = TelnetTerminalServer
