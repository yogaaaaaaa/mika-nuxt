'use strict'

let connCounter = 0

module.exports = {
  use (ctx) {
    connCounter++
    ctx.connId = connCounter
    if (ctx.address) {
      console.log(`[${ctx.connId}] Session start from ${ctx.address.address}`)
    } else {
      console.log(`[${ctx.connId}] Session start`)
    }
    ctx.on('idle', () => console.log(`[${ctx.connId}] Connection idle`))
  },
  useEnd (ctx) {
    console.log(`[${ctx.connId}] Session end`)
  }
}
