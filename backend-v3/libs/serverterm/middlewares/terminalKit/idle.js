'use strict'

module.exports = (duration = 30000) => {
  return (ctx) => {
    ctx.setIdleDuration(duration)
    ctx.on('idle', async () => {
      ctx.term.bold('\n\nIdle, closing connection ...\n')
      await ctx.end()
    })
  }
}
