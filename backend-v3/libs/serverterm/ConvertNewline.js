'use strict'

const { Transform } = require('stream')

const FifoBuffer = require('./FifoBuffer')

const LF = 10
const CR = 13

const streamState = {
  DATA: 'data',
  CR: 'cr'
}

class ConvertNewline extends Transform {
  constructor (options) {
    super(options)
    this._state = streamState.DATA
    this._dataBuf = undefined
  }

  _transform (chunk, encoding, callback) {
    if (chunk === null) {
      this.push(null)
      return callback()
    }

    this._dataBuf = new FifoBuffer(chunk.length * 2)

    for (const b of chunk) this._handle(b)

    const processedChunk = this._dataBuf.flush()
    if (processedChunk) this.push(processedChunk)

    this._dataBuf = undefined

    callback()
  }

  _handle (b) {
    switch (this._state) {
      case streamState.DATA:
        if (b === CR) {
          this._state = streamState.CR
        } else if (b === LF) {
          this._dataBuf.push(CR)
          this._dataBuf.push(LF)
        } else {
          this._dataBuf.push(b)
        }
        break
      case streamState.CR:
        if (b === LF || b === 0) { // CR LF and CR NULL
          this._dataBuf.push(CR)
          this._dataBuf.push(LF)
        } else {
          this._dataBuf.push(CR)
          this._dataBuf.push(LF)
          this._dataBuf.push(b)
        }
        this._state = streamState.DATA
        break
    }
  }
}

module.exports = ConvertNewline
