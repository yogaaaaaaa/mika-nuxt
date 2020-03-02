'use strict'

const { Transform } = require('stream')

class CollectBuffer extends Transform {
  constructor (options = {}) {
    super(options)

    const { collectTime } = options

    this._collectTime = collectTime || 70
    this._collectBuf = undefined
    this._flushCallback = undefined
  }

  _transform (chunk, encoding, callback) {
    if (chunk === null) {
      this.push(null)
      return callback()
    }

    if (this._collectBuf) {
      this._collectBuf = Buffer.concat([this._collectBuf, chunk])
    } else {
      this._collectBuf = chunk
      setTimeout(() => {
        this.push(this._collectBuf, encoding)
        this._collectBuf = undefined
        if (typeof this._flushCallback === 'function') {
          this._flushCallback()
        }
      }, this._collectTime)
    }

    callback()
  }

  _flush (callback) {
    if (this._collectBuf) {
      this._flushCallback = callback
    } else {
      callback()
    }
  }
}

module.exports = CollectBuffer
