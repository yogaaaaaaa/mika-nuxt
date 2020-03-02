'use strict'

/**
 * Card Crypto library
 */

const des = require('./des')
const ipekDukpt = require('./ipekDukpt')
const constants = require('./constants')

module.exports.keys = constants.keys

module.exports.des = des
module.exports.ipekDukpt = ipekDukpt

module.exports.decryptStandardPinBlock = (hsStandardPinBlock) =>
  des.decrypt(exports.keys.STANDARD_KEY, hsStandardPinBlock)
