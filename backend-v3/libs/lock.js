'use strict'

const debug = require('debug')('mika:lock')
const redlock = require('libs/redlock')

/**
 * Mark any reference for locking,
 * with auto extend via timer
 */
module.exports.lockAutoExtend = async ({
  lockRef,
  initialDuration = 30000,
  extendDuration = 10000
}) => {
  let lock
  let isLockDone = false

  try {
    lock = await redlock.lock(lockRef, initialDuration)
    debug('acquired:', lockRef)
  } catch (err) {
    return
  }

  setTimeout(async () => { // initial timeout lock handler
    if (!isLockDone) {
      lock = await lock.extend(extendDuration)
      const extendTimer =
        setInterval(async () => { // periodic lock extend timer
          if (!isLockDone) {
            lock = await lock.extend(extendDuration)
          } else {
            clearInterval(extendTimer)
          }
        }, Math.round(extendDuration * 0.8))
    }
  }, Math.round(extendDuration * 0.8))

  // lockDone() should be called when any process is done
  const lockDone = async () => {
    if (!isLockDone) {
      isLockDone = true
      try {
        await lock.unlock()
      } catch (err) {}
      debug('released:', lockRef)
    }
  }

  return lockDone
}
