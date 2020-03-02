'use strict'

const { Transform } = require('stream')
const { telnetCommands } = require('./constants')

const FifoBuffer = require('./FifoBuffer')

const streamState = {
  DATA: 'data',
  COMMAND: 'command',
  DO: 'do',
  WILL: 'will',
  WONT: 'wont',
  SUB_NEGOTIATION: 'sub',
  SUB_NEGOTIATION_COMMAND: 'subCommand'
}

class TelnetInput extends Transform {
  constructor (options) {
    super(options)

    this._timeout = 1000

    this._state = streamState.DATA

    this._dataBuf = undefined

    this._subNegBufSize = 8192
    this._subNegBuf = undefined
  }

  _transform (chunk, encoding, callback) {
    if (chunk === null) {
      this.push(null)
      callback()
      return
    }

    this._dataBuf = new FifoBuffer(chunk.length)

    for (const b of chunk) this._handle(b)

    const processedChunk = this._dataBuf.flush()
    if (processedChunk) this.push(processedChunk)

    this._dataBuf = undefined

    callback()
  }

  _handle (b) {
    switch (this._state) {
      case streamState.DATA: {
        if (b === telnetCommands.IAC) {
          this._state = streamState.COMMAND
        } else {
          this._dataBuf.push(b)
        }
        break
      }
      case streamState.COMMAND: {
        switch (b) {
          case telnetCommands.DO:
            this._state = streamState.DO
            break
          case telnetCommands.WILL:
            this._state = streamState.WILL
            break
          case telnetCommands.WONT:
            this._state = streamState.WONT
            break
          case telnetCommands.SB:
            this._state = streamState.SUB_NEGOTIATION
            this._subNegBuf = new FifoBuffer(this._subNegBufSize)
            break
          case telnetCommands.IAC:
            this._dataBuf.push(b)
            this._state = streamState.DATA
            break
          default:
            this.emit('command', b)
            this._state = streamState.DATA
        }
        break
      }
      case streamState.DO: {
        this.emit('do', b)
        this._state = streamState.DATA
        break
      }
      case streamState.WILL: {
        this.emit('will', b)
        this._state = streamState.DATA
        break
      }
      case streamState.WONT: {
        this.emit('wont', b)
        this._state = streamState.DATA
        break
      }
      case streamState.SUB_NEGOTIATION: {
        if (b === telnetCommands.IAC && this._subNegBuf.length > 0) {
          this._state = streamState.SUB_NEGOTIATION_COMMAND
        } else {
          this._subNegBuf.push(b)
        }
        break
      }
      case streamState.SUB_NEGOTIATION_COMMAND: {
        if (b === telnetCommands.IAC) {
          this._subNegBuf.push(b)
          this._state = streamState.SUB_NEGOTIATION
        } else if (b === telnetCommands.SE) {
          const subNegBuf = this._subNegBuf.flush()
          this._subNegBuf = undefined
          this.emit('sub', subNegBuf[0], subNegBuf.slice(1))
          this._state = streamState.DATA
        } else { // expect IAC or SE, if not, drop sub negotiation
          this._subNegBuf = undefined
          this._state = streamState.DATA
        }
      }
    }
  }
}

module.exports = TelnetInput
