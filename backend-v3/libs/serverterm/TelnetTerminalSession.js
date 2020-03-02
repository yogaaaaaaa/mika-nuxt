'use strict'

const TelnetTerminal = require('./TelnetTerminal')
const BaseTerminalSessionMixin = require('./BaseTerminalSessionMixin')

class TelnetTerminalSession extends BaseTerminalSessionMixin(TelnetTerminal) {
  constructor (options) {
    super(options)
    if (typeof options.upstream.address === 'function') {
      this.address = options.upstream.address()
    }
  }
}

module.exports = TelnetTerminalSession
