'use strict'

module.exports = (terminalClass) =>
  class BaseTerminalSession extends terminalClass {
    constructor (options) {
      super(options)

      const { terminalServer } = options

      this.server = terminalServer
      this.running = false
    }

    async begin () {
      this.running = true
      try {
        await this.server.runMiddlewares(this)
        await this.end()
      } catch (err) {
        super.end()
        console.error(err)
      }
    }

    end () {
      if (!this.running) return
      if (this._idleTimeout) clearTimeout(this._idleTimeout)
      this.running = false

      return new Promise((resolve, reject) => {
        process.nextTick(async () => {
          await this.server.runEndMiddlewares(this)
          super.end(() => resolve())
        })
      })
    }
  }
