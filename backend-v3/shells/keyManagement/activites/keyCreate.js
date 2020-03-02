'use strict'

const keyManager = require('libs/keyManager')

module.exports = async (ctx) => {
  if (!keyManager.isSessionIdle() && !keyManager.isSessionCreate()) {
    ctx.term.red.bold('Cannot start key create session. Different session type is still running\n')
    await ctx.term.waitForAnyKey()
    return
  }

  try {
    ctx.term.bold('DEK Creation/Ceremony\n\n')
    if (keyManager.isSessionCreate()) {
      ctx.term('Key create session is already started\n')
    } else {
      if (!keyManager.startCreate()) {
        ctx.term.bold.red('Cannot start key create session !\n')
        await ctx.term.waitForAnyKey()
        return
      }
      ctx.term('Starting key create session\n')
    }
    ctx.term('Session will expire in ', keyManager.getSessionTimeLeft(), ' seconds.\n\n')
    ctx.term('Input your password and press [enter]\n')
    ctx.term('Press [escape] to end the session\n\n')

    let passwordInput

    const passwordAddHandler = () => ctx.term.green('-> Key custodian is adding new password\n')
    const interruptHandler = () => keyManager.forceIdleSession()
    const sessionTickHandler = (timeLeft) => {
      if (timeLeft % 20 === 0) {
        ctx.term('-> Session will expire in ', timeLeft, ' seconds\n')
      }
    }

    ctx.once('interrupt', interruptHandler)
    ctx.term.waitForKey(['ESCAPE'], interruptHandler)

    keyManager.on('passwordAdd', passwordAddHandler)
    keyManager.on('sessionTick', sessionTickHandler)

    const endSessionPromise = new Promise((resolve, reject) => {
      keyManager.once('sessionEnd', async (encryptedKeyBox, endReason) => {
        ctx.off('interrupt', interruptHandler)
        keyManager.off('passwordAdd', passwordAddHandler)
        keyManager.off('sessionTick', sessionTickHandler)
        // keyManager.off('sessionTick', sessionTickHandler)
        if (endReason === 'timeout') {
          ctx.term.red.bold('-> Session timeout\n')
        } else if (endReason === 'force') {
          ctx.term.red.bold('-> Forced session end\n')
        } else if (encryptedKeyBox) {
          ctx.term.green.bold('-> Key created \n')
          ctx.term.green.bold('-> Key Id : ', encryptedKeyBox.id, '\n')
        }
        if (passwordInput) passwordInput.stop()
        await ctx.term.waitForAnyKey()
        resolve()
      })
    })

    const passwordPromise = (async () => {
      let retryLeft = 3
      while (retryLeft) {
        passwordInput = ctx.term.inputField({ echo: false })
        const password = await passwordInput.promise
        if (keyManager.isSessionCreate()) {
          if (!password.length) {
            ctx.term.red('-> Your password is empty !\n')
          } else if (await ctx.authCtl.checkPassword(password)) {
            ctx.term.green('-> Your Password has been inputted\n')
            passwordInput = undefined
            await keyManager.pushCreatePassword(password)
            return
          } else {
            ctx.term.red('-> Invalid password !\n')
          }
        } else {
          return
        }
        retryLeft--
      }
      keyManager.forceIdleSession()
    })()

    await Promise.all([
      endSessionPromise,
      passwordPromise
    ])
  } catch (err) {
    keyManager.forceIdleSession()
    throw err
  }
}
