'use strict'

const BaseTerminal = require('./BaseTerminal')
const TelnetInput = require('./TelnetInput')
const TelnetOutput = require('./TelnetOutput')
const ConvertNewline = require('./ConvertNewline')
const CollectBuffer = require('./CollectBuffer')

const { telnetOptions } = require('./constants')

class TelnetTerminal extends BaseTerminal {
  constructor (options) {
    super(options)

    const { collectTime } = options
    // When collectTime is 0, it basically buffer all send data
    // until next event loop
    this._collectTime = collectTime || 0

    // If upstream is a socket, enable nagle algorithm (tinygram prevention)
    if (this._upstream.setNoDelay === 'function') {
      this._upstream = this._upstream.setNoDelay(false)
    }

    // Telnet output stream
    this._input = new TelnetInput()
    this._output = new TelnetOutput()

    // Pipe Input streams
    this._upstream
      .pipe(this._input)

    this._input.on('data', (chunk) => {
      this._refreshIdleTimeout()
      this.push(chunk)
    })
    this._input.on('end', () => {
      this._clearIdleTimeout()
      this.push(null)
    })

    // Pipe Output streams
    this._output
      .pipe(new ConvertNewline())
      .pipe(new CollectBuffer({ collectTime: this._collectTime }))
      .pipe(this._upstream)

    // Go into character mode
    this._initCharacterMode()
  }

  _write (chunk, encoding, callback) {
    this._output.write(chunk, encoding, callback)
  }

  _initCharacterMode () {
    // Basic initialization into character mode
    // at least it works in Putty and linux Telnet client
    this._output.writeWill(telnetOptions.ECHO)
    this._output.writeWont(telnetOptions.LINE_MODE)
    this._output.writeWill(telnetOptions.SUPPRESS_GO_AHEAD)
    this._output.writeDo(telnetOptions.WINDOW_SIZE) // NAWS (negotiate about window size)

    this.echo = true

    // Handle terminal resize
    this._input.on('sub', (option, paramBuf) => {
      if (option === telnetOptions.WINDOW_SIZE) {
        this.columns = paramBuf.readInt16BE(0)
        this.rows = paramBuf.readInt16BE(2)
        this.emit('resize')
      }
    })
  }

  end (callback) {
    super.end(() => {
      this._output.end(() => {
        if (typeof callback === 'function') callback()
      })
    })
  }
}

module.exports = TelnetTerminal
