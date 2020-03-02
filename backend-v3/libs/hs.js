'use strict'

/**
 * Helper to works with hexstring
 */

const crypto = require('crypto')

/**
 * Generate random hex string with help of crypto
 */
module.exports.getRandomHexString = (length = 5) => {
  const randomHexString = crypto.randomBytes(Math.ceil((length / 2))).toString('hex')
  return randomHexString.slice(-length)
}

/**
 * Check whether hex string contain valid character and
 * have correct length (multiple of 2 character or bytes)
 */
module.exports.hexStringValid = (hsData) => {
  const invalidHsRegex = /[^0-9A-Fa-f]/i
  return !invalidHsRegex.test(hsData) && (hsData.length % 2) === 0
}

/**
 * Pad hex string length to correct length of byte
 *
 * Example : 'FE1' to 'FE10' (2 byte, with pad '0' at end)
 *
 */
module.exports.padHexString = (hsData, pad = '0', atStart = false) => {
  if ((hsData.length % 2) > 0) {
    if (atStart) {
      hsData = pad + hsData
    } else {
      hsData = hsData + pad
    }
  }
  return hsData
}

/**
 * Pad hex string data to multiple of n byte
 *
 * example: 'AB01DE' to 'AB01DE000000' (multiple of 4 bytes, with pad '00' at end)
 */
module.exports.padBytesHexString = (hsData, n = 8, pad = '00', atStart = false) => {
  const padLength = Math.round(hsData.length / 2) % n
  if (padLength !== 0) {
    const hsPad = pad.repeat(n - padLength)
    if (atStart) {
      hsData = hsPad + hsData
    } else {
      hsData = hsData + hsPad
    }
  }
  return hsData
}

/**
 * Pad hex string data with '0' to multiple of 8 byte
 */
module.exports.pad8BytesHexString = (hsData) => {
  return exports.padBytesHexString(exports.padHexString(hsData), 8)
}

/**
 * Replace end of string with another string
 *
 * Example :
 * ```
 * str = 'and11'
 * strReplace = 'dro'
 * replaceEnd(str, strReplace) // return 'andro'
 * ```
 */
module.exports.replaceEnd = (str, strReplace) => {
  return `${str.substring(0, str.length - (strReplace.length))}${strReplace}`
}
