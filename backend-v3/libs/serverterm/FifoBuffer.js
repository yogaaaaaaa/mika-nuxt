'use strict'

class FifoBuffer {
  constructor (size) {
    this.size = size
    this._buf = Buffer.alloc(this.size)
    this._bufIndex = 0
  }

  get length () {
    return this._bufIndex
  }

  isFull () {
    return (this._bufIndex >= this._buf.length)
  }

  push (b) {
    if (this.isFull()) {
      throw Error('FIFO buffer overflow')
    }
    this._buf[this._bufIndex] = b
    this._bufIndex++
  }

  pull () {
    this._bufIndex--
    const b = this._buf[this._bufIndex - 1]
    if (this._bufIndex < 0) this._bufIndex = 0
    return b
  }

  flush () {
    if (this._bufIndex > 0) {
      return this._buf.slice(0, this._bufIndex)
    }
    this.clear()
  }

  clear () {
    this._bufIndex = 0
  }
}

module.exports = FifoBuffer
