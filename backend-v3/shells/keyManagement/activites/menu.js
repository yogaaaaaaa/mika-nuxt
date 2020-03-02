'use strict'

module.exports = async (ctx) => {
  const menus = [
    'DEK Status',
    'DEK Activation/Unlock',
    'DEK Creation/Key Ceremony',
    'Logout'
  ]

  while (1 && ctx.running) {
    ctx.term.clear()

    ctx.term.bold('\n')
    ctx.term.bold('  Welcome, '); ctx.term.bold.green(`${ctx.authCtl.auth.username}`); ctx.term('\n')
    ctx.term.bold('  What do you want to do ?\n')

    const menu = await ctx.term.singleColumnMenu(menus).promise
    switch (menu.selectedIndex) {
      case 0:
        ctx.term.clear()
        await require('./keyStatus')(ctx)
        break
      case 1:
        ctx.term.clear()
        await require('./keyUnlock')(ctx)
        break
      case 2:
        ctx.term.clear()
        await require('./keyCreate')(ctx)
        break
      default:
        return
    }
  }
}
