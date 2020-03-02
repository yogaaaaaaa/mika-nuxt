'use strict'

/**
 * Fairpay Style DUKPT library
 */

const dukpt = require('dukpt')
const dukptData = require('dukpt/dist/lib/data.lib')

const hs = require('../hs')

/**
 * Get KSN Counter (20 bit LSB of KSN)
 */
module.exports.ksnCounterGet = (hsKSN) => {
  return hsKSN.slice(-5)
}

/**
 * Set KSN Counter (20 bit LSB of KSN)
 */
module.exports.ksnCounterSet = (hsKSN, hsKSNCounter) => {
  return hs.replaceEnd(hsKSN, hsKSNCounter.slice(-5)).toUpperCase()
}

/**
 * Increase KSN Counter (20 bit LSB of KSN)
 */
module.exports.ksnCounterIncrement = (hsKSN, increment = 1) => {
  const ksnCounterBuffer = (Buffer.from(exports.ksnCounterGet(hsKSN).padStart(8, '0'), 'hex'))
  ksnCounterBuffer.writeUInt32BE(ksnCounterBuffer.readUInt32BE(0) + increment)

  return exports.ksnCounterSet(hsKSN, ksnCounterBuffer.toString('hex'))
}

/**
 * Randomize KSN Counter (20 bit LSB of KSN)
 */
module.exports.ksnCounterRandomize = (hsKSN) => {
  return exports.ksnCounterSet(hsKSN, hs.getRandomHexString(5))
}

/**
 * Derive session key from IPEK and KSN
 * mask is either, 'pin' or 'data'
 * if mask is empty, key will not be masked (and processed)
 */
module.exports.IpekDeriveKey = (hsIPEK, hsKSN, mask = '') => {
  if (mask) {
    if (mask === 'pin') {
      return dukpt._createPINKeyHex(hsIPEK, hsKSN)
    } else if (mask === 'data') {
      return dukpt._createDataKeyHex(hsIPEK, hsKSN)
    }
  } else {
    return dukpt._deriveKeyHex(hsIPEK, hsKSN)
  }
}

/**
 * 3DES Encrypt of PINBLOCK with IPEK and KSN
 */
module.exports.encrypt3DESPinblockWithIPEK = (hsIPEK, hsKSN, hsPinblock) => {
  const key = dukpt._EDE3KeyExpand(dukpt._createPINKeyHex(hsIPEK, hsKSN)) // ede mode key expand
  return dukptData.dataToHexstring(dukpt.encryptTDES(key, hsPinblock, true))
}

/**
 * 3DES Encrypt of DATA with IPEK and KSN
 */
module.exports.encrypt3DESDataWithIPEK = (hsIPEK, hsKSN, hsData) => {
  const key = dukpt._EDE3KeyExpand(dukpt._createDataKeyHex(hsIPEK, hsKSN))
  return dukptData.dataToHexstring(dukpt.encryptTDES(key, hsData, true))
}

/**
 * 3DES Decrypt of DATA with IPEK and KSN
 */
module.exports.decrypt3DESDataWithIPEK = (hsIPEK, hsKSN, hsData) => {
  const key = dukpt._EDE3KeyExpand(dukpt._createDataKeyHex(hsIPEK, hsKSN))
  return dukptData.dataToHexstring(dukpt.encryptTDES(key, hsData, false))
}
