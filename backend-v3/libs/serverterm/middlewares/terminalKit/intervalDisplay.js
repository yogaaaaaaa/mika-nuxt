'use strict'

module.exports = (ctx) => {
  ctx.term.intervalDisplay = async function ({
    display,
    interval = 1000,
    ignoreIdle = true,
    exitKeys = ['ESCAPE']
  }) {
    if (ignoreIdle) ctx.disableIdleTimeout()
    const displayInterval = setInterval(display, interval)
    display(ctx)
    await ctx.term.waitForKey(exitKeys)
    clearInterval(displayInterval)
    if (ignoreIdle) ctx.enableIdleTimeout()
  }
}
