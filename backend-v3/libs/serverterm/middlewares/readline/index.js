'use strict'

const readline = require('readline')

module.exports = (ctx) => {
  ctx.readline = readline
  ctx.rl = readline.createInterface({
    input: ctx.terminal,
    output: ctx.terminal,
    terminal: true
  })
}
