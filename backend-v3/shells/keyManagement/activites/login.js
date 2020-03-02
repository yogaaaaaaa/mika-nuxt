'use strict'

const { delay } = require('libs/timer')

module.exports = async (ctx) => {
  let loginTry = 3
  while (loginTry) {
    ctx.term.reset()
    ctx.term.clear()

    ctx.term.windowTitle('Mika Core Key Management Shell')

    ctx.term.bold('Welcome to Mika Core key Management Shell\n')
    ctx.term(`Your IP is ${ctx.address.address} \n`)

    ctx.term('\nLogin : ')
    const username = await ctx.term.inputField().promise

    ctx.term('\nPassword : ')
    const password = await ctx.term.inputField({ echo: false }).promise

    if (await ctx.authCtl.login(username, password)) {
      ctx.authCtl.once('authOverride', () => {
        ctx.term.red.bold('\n\n\nAuthentication override !\n')
        ctx.term.bold('Currently logged credential is being used in another place.\n\n')
        ctx.emit('interrupt')
        ctx.end()
      })
      return
    } else {
      ctx.term.bold.red('\n\nInvalid Credentials !\n')
      await delay(2000)
    }
    loginTry--
  }
  return true
}
