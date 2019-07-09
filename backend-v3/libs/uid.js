'use strict'

/**
 * Encapsulate implementation of encoding, UID, and random generation string
 *
 * Note :
 * - About KSUID : https://segment.com/blog/a-brief-history-of-the-uuid/
 */

const base32Encode = require('base32-encode')
const base32Decode = require('base32-decode')

exports.ksuid = require('ksuid')
exports.uuidv4 = require('uuid/v4')
exports.bufferBn = require('bigint-buffer')

module.exports.base32CrfEncode = (buffer) => {
  return base32Encode(buffer, 'Crockford')
}

module.exports.base32CrfDecode = (str) => {
  return Buffer.from(base32Decode(str, 'Crockford'))
}

module.exports.generateTransactionId = async () => {
  let ksuid = await exports.ksuid.random()
  let ksuidBase32Crf = exports.base32CrfEncode(ksuid.raw)
  return {
    id: ksuid.string,
    idAlias: ksuidBase32Crf,
    idAliasFormatted: ksuidBase32Crf.match(/.{1,8}/g).join('-')
  }
}

module.exports.ksuidTo64Int = (ksuid) => {
  return exports.bufferBn.toBigIntBE(Buffer.concat([ksuid.raw.slice(0, 4), ksuid.raw.slice(ksuid.raw.length - 4, ksuid.raw.length)]))
}

module.exports.ksuidToBigInt = (ksuid) => {
  return exports.bufferBn.toBigIntBE(ksuid.raw)
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
