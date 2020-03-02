'use strict'

const terminalKit = require('terminal-kit')

module.exports = {
  use (ctx) {
    // Hacky way to remove event listener
    const events = []
    const removeListenerHandler = (event, listener) => events.push({ event, listener })
    process.on('newListener', removeListenerHandler)
    ctx.term = terminalKit.createTerminal({
      stdin: ctx,
      stdout: ctx,
      stderr: ctx,
      isTTY: true,
      isSSH: true
    })
    ctx.term.timeout = 1000
    process.off('newListener', removeListenerHandler)
    for (const event of events) process.off(event.event, event.listener)
  },
  async useEnd (ctx) {
    await ctx.term.asyncCleanup()
  }
}
