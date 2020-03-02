'use strict'

module.exports = (ctx) => {
  // Default interrupt key handling
  ctx.term.on('key', (name, matches, data) => {
    if (name === 'CTRL_C' || name === 'CTRL_D') {
      ctx.emit('interrupt')
      ctx.end()
    }
  })

  // Simpler decorator for key event
  ctx.term.waitForKey = (keys, callback) => {
    const createListener = (callback) => {
      const listener = (name) => {
        if (Array.isArray(keys) && !keys.includes(name)) return
        ctx.term.off('key', listener)
        callback(name)
      }
      ctx.term.on('key', listener)
    }
    if (typeof callback === 'function') {
      createListener(callback)
    } else {
      return new Promise((resolve) => createListener(resolve))
    }
  }
}
