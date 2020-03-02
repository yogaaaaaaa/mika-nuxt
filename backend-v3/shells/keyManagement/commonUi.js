'use strict'

module.exports = (ctx) => {
  ctx.term.waitForAnyKey = async () => {
    ctx.term.green.bold('\nPress any key to continue ... ')
    await ctx.term.waitForKey()
  }
}
