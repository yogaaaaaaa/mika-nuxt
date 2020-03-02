'use strict'

const { Transform } = require('stream')
const { telnetCommands } = require('./constants')

const FifoBuffer = require('./FifoBuffer')

class TelnetOutput extends Transform {
  constructor (options) {
    super(options)
    this._dataBuf = undefined
  }

  _transform (chunk, encoding, callback) {
    if (chunk === null) {
      this.push(null)
      callback()
      return
    }

    this._dataBuf = new FifoBuffer(chunk.length * 2)

    for (const b of chunk) this._handle(b)

    const processedChunk = this._dataBuf.flush()
    if (processedChunk) this.push(processedChunk)

    this._dataBuf = undefined

    callback()
  }

  _handle (b) {
    if (b === telnetCommands.IAC) { // Escape IAC
      this._dataBuf.push(b)
      this._dataBuf.push(b)
    } else {
      this._dataBuf.push(b)
    }
  }

  writeCommand (command) {
    // IAC COMMAND <OPTION>
    this.push(Buffer.from([telnetCommands.IAC, command]))
  }

  writeDo (option) {
    // IAC DO <OPTION>
    this.push(Buffer.from([telnetCommands.IAC, telnetCommands.DO, option]))
  }

  writeWill (option) {
    // IAC WILL <OPTION>
    this.push(Buffer.from([telnetCommands.IAC, telnetCommands.WILL, option]))
  }

  writeWont (option) {
    // IAC WONT <OPTION>
    this.push(Buffer.from([telnetCommands.IAC, telnetCommands.WONT, option]))
  }

  writeSub (option, paramBuf) {
    // IAC <OPTION> [PARAM] IAC SE
    const subBuf = new FifoBuffer((paramBuf.length * 2) + 4)
    subBuf.push(telnetCommands.IAC)
    subBuf.push(option)
    let isEscape = false
    for (const b of paramBuf) {
      if (b === telnetCommands.IAC) {
        if (isEscape) {
          subBuf.push(b)
          isEscape = false
        } else {
          isEscape = true
        }
      } else {
        subBuf.push(b)
      }
    }
    subBuf.push(telnetCommands.IAC)
    subBuf.push(telnetCommands.SE)

    this.push(subBuf)
  }
}

module.exports = TelnetOutput
