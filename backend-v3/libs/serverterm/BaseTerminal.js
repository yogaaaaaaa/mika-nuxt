'use strict'

const { Duplex } = require('stream')
const util = require('util')

class BaseTerminal extends Duplex {
  constructor (options) {
    options.allowHalfOpen = false
    super(options)

    const { upstream, newline } = options

    this._newline = newline || '\n'
    this._upstream = upstream

    // Base terminal state
    this.isTTY = true
    this.rows = null
    this.columns = null
    this.echo = null
    this.idle = false
    this._idleDuration = null
    this._idleTimeout = undefined
  }

  _read (size) {}

  _write (chunk, encoding, callback) {}

  write (...args) {
    if (this.writableEnded) return
    return super.write(...args)
  }

  _refreshIdleTimeout () {
    this.idle = false
    if (this._idleTimeout) this._idleTimeout.refresh()
  }

  _clearIdleTimeout () {
    if (this._idleTimeout) clearTimeout(this._idleTimeout)
    this._idleTimeout = undefined
  }

  enableIdleTimeout () {
    if (this._idleDuration && !this.readableEnded) {
      this._idleTimeout = setTimeout(() => {
        this.idle = true
        this.emit('idle')
      }, this._idleDuration)
    }
  }

  disableIdleTimeout () {
    this._clearIdleTimeout()
  }

  setIdleDuration (value) {
    this._idleDuration = value || 0
    this.enableIdleTimeout()
  }

  get idleDuration () {
    return this._idleDuration || 0
  }

  log (...args) {
    return new Promise((resolve, reject) => {
      const str = `${util.format(...args)}${this._newline}`
      const retval = this.write(str, () => resolve(retval))
    })
  }
}

module.exports = BaseTerminal
