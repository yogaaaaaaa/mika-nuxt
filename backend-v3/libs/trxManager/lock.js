'use strict'

const lock = require('libs/lock')
const config = require('configs/trxManagerConfig')

/**
 * trxManager lock agent. Mark agent (by id)
 * as locked.
 *
 * Return a function that MUST be called to release
 * the lock
 */
module.exports.lockAgent = async (agentId) => {
  const lockRef =
    `trxManagerLockAgentId${agentId}`

  return lock.lockAutoExtend({
    lockRef,
    initialDuration: config.initialAgentLockDuration,
    extendDuration: config.extendAgentLockDuration
  })
}
