'use strict'

module.exports = (serverClass) =>
  class BaseTerminalServer extends serverClass {
    constructor (options) {
      super(options)

      this._middlewares = []
      this._endMiddlewares = []
    }

    async _handleConnection (socket) {}

    async runMiddlewares (ctx) {
      let error
      for (const middleware of this._middlewares) {
        if (!ctx.running) return
        let retVal
        try {
          if (middleware.length === 2) {
            retVal = await middleware(error, ctx)
            error = null
          } else {
            if (!error) {
              retVal = await middleware(ctx)
            }
          }
        } catch (err) {
          error = err
        }
        if (retVal) break
      }
      if (error) throw error
    }

    async runEndMiddlewares (ctx) {
      for (const endMiddleware of this._endMiddlewares) {
        await endMiddleware(ctx)
      }
    }

    use (middlewares) {
      middlewares = Array.isArray(middlewares)
        ? Array.callbacks.flat(10)
        : [middlewares]
      for (const middleware of middlewares) {
        if (typeof middleware === 'function') {
          this._middlewares.push(middleware)
        } else if (
          typeof middleware === 'object' &&
      typeof middleware.use === 'function'
        ) {
          this._middlewares.push(middleware.use)
          if (typeof middleware.useEnd === 'function') {
            this._endMiddlewares.push(middleware.useEnd)
          }
        } else {
          throw Error('Middleware is not a valid function or object')
        }
      }
    }
  }
