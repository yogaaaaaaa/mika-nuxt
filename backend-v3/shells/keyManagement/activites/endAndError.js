'use strict'

const { delay } = require('libs/timer')

module.exports = async (err, ctx) => {
  if (err) {
    console.error(err)
    ctx.term.bold.red('Internal server Error !\n')
  } else {
    ctx.term.clear()
    ctx.term.green.bold('\n\n  Have a nice day !  ')
    await delay(2000)
    ctx.term.clear()
  }
  return true
}
