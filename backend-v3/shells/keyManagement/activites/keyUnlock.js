'use strict'

const keyManager = require('libs/keyManager')

module.exports = async (ctx) => {
  if (!keyManager.isSessionIdle() && !keyManager.isSessionUnlock()) {
    ctx.term.red.bold('Cannot start key unlock session. Different session type is still running\n')
    await ctx.term.waitForAnyKey()
    return
  }

  const keyBox = await keyManager.getKey()
  if (keyBox) {
    ctx.term.bold('DEK is already loaded !\n')
    ctx.term.bold('Key Id : '); ctx.term(keyBox.id); ctx.term('\n')
    ctx.term.red.bold('Do want to override current DEK ?'); ctx.term(' [y/N] ')
    const result = await ctx.term.yesOrNo({ yes: ['y'], no: ['n', 'ENTER'] }).promise
    if (!result) return
    ctx.term.clear()
  }
  try {
    ctx.term.bold('DEK Unlock/Activation\n\n')
    if (keyManager.isSessionUnlock()) {
      ctx.term('Key unlock session is already started\n')
    } else {
      if (!(await keyManager.startUnlock())) {
        ctx.term.bold.red('Cannot start key unlock session !\n')
        ctx.term.bold.red('Possibly caused by non-existent or invalid encrypted DEK file\n\n')
        await ctx.term.waitForAnyKey()
        return
      }
      ctx.term('Starting key unlock session\n')
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
      keyManager.once('sessionEnd', async (keyBox, endReason) => {
        ctx.off('interrupt', interruptHandler)
        keyManager.off('passwordAdd', passwordAddHandler)
        keyManager.off('sessionTick', sessionTickHandler)
        // keyManager.off('sessionTick', sessionTickHandler)
        if (endReason === 'timeout') {
          ctx.term.red.bold('-> Session timeout\n')
        } else if (endReason === 'force') {
          ctx.term.red.bold('-> Forced session end\n')
        } else if (keyBox) {
          ctx.term.green.bold('-> Key unlocked \n')
          ctx.term.green.bold('-> Key Id : ', keyBox.id, '\n')
        } else {
          ctx.term.red.bold('-> Unlock Failed !\n')
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
        if (keyManager.isSessionUnlock()) {
          if (!password.length) {
            ctx.term.red('-> Your password is empty !\n')
          } else {
            ctx.term.green('-> Your Password has been inputted\n')
            passwordInput = undefined
            await keyManager.pushUnlockPassword(password)
            return
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
