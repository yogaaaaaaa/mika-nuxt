'use strict'

/**
 * Encapsulate implementation of encoding, UID, and random generation string
 */

const base32Encode = require('base32-encode')
const base32Decode = require('base32-decode')

exports.ksuid = require('ksuid')
exports.uuidv4 = require('uuid/v4')

module.exports.base32CrfEncode = (buffer) => {
  return base32Encode(buffer, 'Crockford')
}

module.exports.base32CrfDecode = (str) => {
  return Buffer.from(base32Decode(str, 'Crockford'))
}

module.exports.generateTransactionId = (name) => {
  let ksuid = exports.ksuid.randomSync()
  let part = exports.base32CrfEncode(ksuid.raw).substring(0, 12).match(/.{1,6}/g)
  return {
    id: ksuid.string,
    idAlias: `${name}-${part[0]}-${part[1]}`
  }
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
