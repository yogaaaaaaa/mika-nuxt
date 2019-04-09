'use strict'

/**
 * Encapsulate implementation of encoding, UID, and random generation string
 */

const ksuid = require('ksuid')
const uuidv4 = require('uuid/v4')

/**
 * Generate uuidv4
 */
module.exports.uuidv4 = (length) => {
  return uuidv4()
}

/**
 * Generate KSUID as fixed string or buffer (`raw === true`)
 */
module.exports.ksuid = (raw = true) => {
  let uid = ksuid.randomSync()
  if (raw) {
    return uid.raw
  }
  return uid.string
}

/**
 * Generate monotonically random string
 *
 * WARNING: not suitable for any cryptography purposes
 */
module.exports.randomString = (length = 16) => {
  const charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

  if (length < 16) {
    length = 16
  }

  let random = Date.now().toString(36)

  let startLength = random.length

  for (let i = 0; i < length - startLength; i++) {
    random += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return random
}
