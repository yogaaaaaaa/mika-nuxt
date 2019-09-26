'use strict'

/**
 * Encapsulate implementation of encoding, UID, and random generation string
 *
 * Note :
 * - About KSUID : https://segment.com/blog/a-brief-history-of-the-uuid/
 * - About ULID: https://github.com/ulid/spec
 */

const base32Encode = require('base32-encode')
const base32Decode = require('base32-decode')

const baseX = require('base-x')
const base62Mika = baseX('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')

exports.ulid = require('id128').Ulid
exports.ksuid = require('ksuid')

module.exports.base32CrfEncode = (buffer) => {
  return base32Encode(buffer, 'Crockford')
}

module.exports.base32CrfDecode = (str) => {
  return Buffer.from(base32Decode(str, 'Crockford'))
}

module.exports.base62MikaEncode = (buffer) => {
  return base62Mika.encode(buffer)
}

module.exports.base62MikaDecode = (str) => {
  return base62Mika.decode(str)
}

module.exports.generateTransactionId = async () => {
  const ulid = exports.ulid.generate()

  const ulidCanonical = ulid.toCanonical()
  const ulidBase62Mika = exports.base62MikaEncode(ulid.bytes)

  const ulidCanonicalTime = ulidCanonical.substring(0, 10)
  const ulidCanonicalRandom = ulidCanonical.slice(-16).match(/.{1,8}/g).join('-')
  const ulidCanonicalFormatted = `${ulidCanonicalTime}-${ulidCanonicalRandom}`

  return {
    id: ulidBase62Mika,
    idAlias: ulidCanonical,
    idAliasFormatted: ulidCanonicalFormatted
  }
}

module.exports.generateUlid = () => {
  const ulid = exports.ulid.generate()

  return {
    ulid: ulid,
    buffer: ulid.bytes,
    canonical: ulid.toCanonical(),
    base62mika: exports.base62MikaEncode(ulid.bytes),
    base32crf: exports.base32CrfEncode(ulid.bytes)
  }
}

module.exports.generateKsuid = async () => {
  const ksuid = await exports.ksuid.random()

  return {
    ksuid: ksuid,
    buffer: ksuid.raw,
    canonical: ksuid.string,
    base62mika: exports.base62MikaEncode(ksuid.raw),
    base32crf: exports.base32CrfEncode(ksuid.raw)
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

  const startLength = random.length

  for (let i = 0; i < length - startLength; i++) {
    random += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return random
}
