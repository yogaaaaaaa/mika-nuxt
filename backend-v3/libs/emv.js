'use strict'

/**
 * Mix and match module to works with EMV
 * It include
 * - Hexstring madness
 * - DUKPT key management
 * - 3DES encryption
 * - TLV parser, serializer and annotator
 */

const crypto = require('crypto')

const dukpt = require('dukpt')
const dukptData = require('dukpt/lib/data.lib')

const berTlv = require('ber-tlv')
const berTlvAnnotations = require('ber-tlv-annotations')
let berTlvRegistry = new berTlvAnnotations.AnnotationRegistry()
berTlvRegistry.registerPackagedProviders()

/**
 * Expose all module
 */
module.exports.dukpt = dukpt
module.exports.dukptData = dukptData

module.exports.berTlv = berTlv
module.exports.berTlvAnnotations = berTlvAnnotations

// Entry Mode, see : https://en.wikipedia.org/wiki/ISO_8583
module.exports.posEntryMode = {
  MAGSTRIPE_WITH_PIN: '021',
  MAGSTRIPE_WITH_SIGNATURE: '022',
  CHIP_WITH_OFFLINE_PIN: '050',
  CHIP_WITH_PIN: '051',
  CHIP_WITH_SIGNATURE: '052'
}

module.exports.panEntryMode = {
  UNKNOWN: '00',
  MANUAL: '01',
  MAGSTRIPE: '02',
  CHIP: '05'
}

module.exports.pinEntryMode = {
  UNKNOWN: '0',
  PIN: '1',
  NO_PIN: '2'
}

module.exports.getPANEntryMode = (entryMode) => {
  return entryMode.substring(0, 2)
}

module.exports.getPINEntryMode = (entryMode) => {
  return entryMode.slice(-1)
}

/**
 * Based on binaryfoo emv-bertlv library
 * see: https://github.com/binaryfoo/emv-bertlv/blob/master/src/main/java/io/github/binaryfoo/EmvTags.java
*/
module.exports.emvTags = {
  RECOGNISE_CARD_SUPPORTED_OPTIONS: 'DF8178',
  ASCII_CODE_TABLE_INDEX: 'DF8172',
  BRAND_TABLE: 'FB',
  BRAND_TABLE_CHIP_FLAG: 'DF8173',
  BRAND_ID: 'DF5F',
  APPLICATION_SELECTION_INDICATOR: 'DF8175',
  BRAND_ACCEPTED: 'DF8174',
  AID_TABLE_DOMESTIC_FLAG: 'DF9009',
  NEXT_INDEX_IF_POS: 'DF9007',
  NEXT_INDEX_IF_NEG: 'DF9008',
  AID_TABLE: 'E5',
  POS_ENTRY_MODE: '9F39',
  TERMINAL_APPLICATION_VERSION_NUMBER: '9F09',
  DEFAULT_DDOL: 'DF5D',
  TAC_DENIAL: 'DF57',
  TAC_ONLINE: 'DF58',
  TAC_DEFAULT: 'DF56',
  TERMINAL_FLOOR_LIMIT: '9F1B',
  TARGET_PERCENTAGE: 'DF5A',
  MAX_TARGET_PERCENTAGE: 'DF5B',
  THRESHOLD_VALUE: 'DF5C',
  FINAL_SELECT_INITIATE_TX: 'DF3A',
  TRANSACTION_CURRENCY_CODE: '5F2A',
  TERMINAL_COUNTRY_CODE: '9F1A',
  TRANSACTION_CURRENCY_EXPONENT: '5F36',
  MERCHANT_ID: '9F16',
  MERCHANT_CATEGORY_CODE: '9F15',
  TERMINAL_ID: '9F1C',
  TERMINAL_CAPABILITIES: '9F33',
  ADDITIONAL_TERMINAL_CAPABILITIES: '9F40',
  TERMINAL_TYPE: '9F35',
  APPLICATION_ID: '9F06',
  TRANSACTION_DATE: '9A',
  TRANSACTION_TIME: '9F21',
  TRANSACTION_AMOUNT: 'DF50',
  OFFLINE_TOTAL_AMOUNT: 'DF52',
  TRANSACTION_TYPE: '9C',
  TRANSACTION_GROUP: 'E0',
  TABLE_RECORD: 'EF',
  CA_PUBLIC_KEY_MODULUS: 'DF53',
  CA_PUBLIC_KEY_EXPONENT: 'DF54',
  TRANSACTION_SEQUENCE_COUNTER: '9F41',
  AMOUNT_AUTHORIZED: '9F02',
  AMOUNT_OTHER: '9F03',
  APPLICATION_INTERCHANGE_PROFILE: '82',
  APPLICATION_TRANSACTION_COUNTER: '9F36',
  APPLICATION_CRYPTOGRAM: '9F26',
  ISSUER_APPLICATION_DATA: '9F10',
  TERMINAL_CURRENCY_CODE: '5F2A',
  TERMINAL_SERIAL_NUMBER: '9F1E',
  UNPREDICTABLE_NUMBER: '9F37',
  CVM_RESULTS: '9F34',
  CRYPTOGRAM_INFORMATION_DATA: '9F27',
  HOST_INCIDENT_CODE: 'DF2E',
  ISSUER_AUTHENTICATION_DATA: '91',
  ISSUER_SCRIPT_TERMPLATE_1: '71',
  ISSUER_SCRIPT_TERMPLATE_2: '72',
  APPLICATION_LABEL: '50',
  DEDICATED_FILE_NAME: '84',
  APPLICATION_PRIORITY_INDICATOR: '87',
  CA_PUBLIC_KEY_INDEX: '8F',
  TRACK_2_EQUIVALENT_DATA: '57',
  CARD_HOLDER_NAME: '5F20',
  TRACK_1_DISCRETIONARY_DATA: '9F1F',
  TRACK_2_DISCRETIONARY_DATA: '9F20',
  CARD_EXPIRY: '5F24',
  ISSUER_COUNTRY_CODE: '5F28',
  PAN_SEQUENCE_NUMBER: '5F34',
  PAN: '5A',
  AUTHORISATION_RESPONSE_CODE: '8A',
  TERMINAL_VERIFICATION_RESULTS: '95',
  TSI: '9B',
  CVM_LIST: '8E',
  APPLICATION_CURRENCY_CODE: '9F42',
  TRANSACTION_CATEGORY_CODE: '9F53',
  FCI_TEMPLATE: '6F',
  FCI_PROPRIETARY_TEMPLATE: 'A5',
  AFL: '94',
  APPLICATION_EFFECTIVE_DATE: '5F25',
  PDOL: '9F38',
  CDOL_1: '8C',
  CDOL_2: '8D',
  APPLICATION_USAGE_CONTROL: '9F07',
  CARD_APPLICATION_VERSION_NUMBER: '9F08',
  IAC_DEFAULT: '9F0D',
  IAC_DENIAL: '9F0E',
  IAC_ONLINE: '9F0F',
  SDA_TAG_LIST: '9F4A',
  ISSUER_PUBLIC_KEY_EXPONENT: '9F32',
  ISSUER_PUBLIC_KEY_REMAINDER: '92',
  ISSUER_PUBLIC_KEY_CERTIFICATE: '90',
  ICC_PUBLIC_KEY_EXPONENT: '9F47',
  ICC_PUBLIC_KEY_REMAINDER: '9F48',
  ICC_PIN_ENCIPHERMENT_PUBLIC_KEY: '9F2D',
  ICC_PIN_ENCIPHERMENT_PUBLIC_KEY_EXPONENT: '9F2E',
  ICC_PIN_ENCIPHERMENT_PUBLIC_KEY_MODULUS: '9F2F',
  SIGNED_DYNAMIC_APPLICATION_DATA: '9F4B',
  RESPONSE_TEMPLATE: '77',
  PIN_TRY_COUNTER: '9F17',
  SIGNED_STATIC_APPLICATION_DATA: '93',
  ICC_PUBLIC_KEY_CERTIFICATE: '9F46',
  DATA_AUTHENTICATION_CODE: '9F45',
  ICC_DYNAMIC_NUMBER: '9F4C',
  RESPONSE_TEMPLATE_2: '70',
  FCI_DISCRETIONARY_DATA: 'BF0C',
  SERVICE_CODE: '5F30',
  LANGUAGE_PREFERENCE: '5F2D',
  ISSUER_CODE_TABLE_INDEX: '9F11',
  APPLICATION_PREFERRED_NAME: '9F12',
  APPLICATION_CURRENCY_EXPONENT: '9F44',
  APPLICATION_REFERENCE_CURRENCY: '9F3B',
  APPLICATION_REFERENCE_CURRENCY_EXPONENT: '9F43',
  DDOL: '9F49',
  NON_TLV_RESPONSE_TEMPLATE: '80'
}

/**
 * Search tag from TLV list (an array)
 */
module.exports.tlvTagFind = (tag, tlvList, toHexString = true) => {
  for (let i = 0; i < tlvList.length; i++) {
    if (tlvList[i].tag === tag) {
      if (toHexString) {
        return tlvList[i].value.toString('hex').toUpperCase()
      } else {
        return tlvList[i]
      }
    }
  }
  return null
}

/**
 * Encode TLV array list into TLV String
 */
module.exports.tlvEncode = (tlvList) => {
  return berTlv.TlvFactory.serialize(tlvList)
}

/**
 * Decode TLV String into TLV array list
 */
module.exports.tlvDecode = (hsTlv) => {
  return berTlv.TlvFactory.parse(hsTlv)
}

/**
 * Annotate current TLV object
 */
module.exports.tlvAnnotate = (tlvAnnotate) => {
  return berTlvRegistry.lookupAnnotation(tlvAnnotate)
}

/**
 * Does exactly what it says on the tin
 */
module.exports.getRandomHexString = (length = 5) => {
  let randomHexString = crypto.randomBytes(Math.ceil((length / 2))).toString('hex')
  return randomHexString.slice(-length)
}

/**
 * Remove '=' symbol from Track2, to be compatible with EMV tags
 */
module.exports.track2RemoveSymbol = (hsTrack2) => {
  return hsTrack2.replace('=', 'D')
}

/**
 * Get PAN from track2
 */
module.exports.track2GetPAN = (hsTrack2) => {
  let separatorPos = hsTrack2.indexOf('D')
  if (separatorPos === -1) separatorPos = hsTrack2.indexOf('=')
  return hsTrack2.substring(0, separatorPos)
}

/**
 * Replace end of string with another string
 * Example :
 * str = 'and11'
 * strReplace = 'dro'
 * return 'andro'
 */
module.exports.replaceEnd = (str, strReplace) => {
  return `${str.substring(0, str.length - (strReplace.length))}${strReplace}`
}

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
  return exports.replaceEnd(hsKSN, hsKSNCounter.slice(-5)).toUpperCase()
}

/**
 * Increase KSN Counter (20 bit LSB of KSN)
 */
module.exports.ksnCounterIncrement = (hsKSN, increment = 1) => {
  let ksnCounterBuffer = (Buffer.from(exports.ksnCounterGet(hsKSN).padStart(8, '0'), 'hex'))
  ksnCounterBuffer.writeUInt32BE(ksnCounterBuffer.readUInt32BE(0) + increment)

  return exports.ksnCounterSet(hsKSN, ksnCounterBuffer.toString('hex'))
}

/**
 * Randomize KSN Counter (20 bit LSB of KSN)
 */
module.exports.ksnCounterRandomize = (hsKSN) => {
  return exports.ksnCounterSet(hsKSN, exports.getRandomHexString(5))
}

/**
 * Even the hex string length
 */
module.exports.evenHexStringData = (hsData) => {
  if ((hsData.length % 2) > 0) {
    hsData += '0'
  }

  return hsData
}

/**
 * Pad hex string data to multiple of n byte
 */
module.exports.padHexStringData = (hsData, n = 8) => {
  let modulus = Math.round(hsData.length / 2) % n
  if (modulus !== 0) {
    for (let i = 0; i < n - modulus; i++) {
      hsData += '00'
    }
  }

  return hsData
}

/**
 * Event length of hexstring and pad it until multiple of 8 bytes
 */
module.exports.evenAndPadHexstring = (hsData) => {
  return exports.padHexStringData(exports.evenHexStringData(hsData))
}

/**
 * Generate Format 0 (ISO-0) Pinblock
 * For more information see: https://www.eftlab.co.uk/index.php/site-map/knowledge-base/261-complete-list-of-pin-blocks-in-payments
 */
module.exports.generateISO0Pinblock = (hsPan, hsPin) => {
  let pinBlockPAN = `0000${hsPan.substring(3, 15)}`
  let pinBlockPIN = (`${String(hsPin.length).padStart(2, '0')}${hsPin}`).padEnd(16, 'f')

  let pinBlockPINBuffer = Buffer.from(pinBlockPIN, 'hex')
  let pinBlockPANBuffer = Buffer.from(pinBlockPAN, 'hex')

  let pinBlockBuffer = Buffer.alloc(pinBlockPINBuffer.length)

  for (let i = 0; i < pinBlockBuffer.length; i++) {
    pinBlockBuffer[i] = pinBlockPANBuffer[i] ^ pinBlockPINBuffer[i]
  }

  return pinBlockBuffer.toString('hex').toUpperCase()
}

/**
 * Derive session key from IPEK and KSN
 * mask is either, 'pin' or 'data'
 * if mask is empty, key will not be masked (and processed)
 */
module.exports.deriveKey = (hsIPEK, hsKSN, mask = '') => {
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
 * Note :
 * It will derive session key (or PEK, future key) and mask it with PIN Variant
 * then encrypt pinblock with 3DES, using generated key
 */
module.exports.encrypt3DESPinblockWithIPEK = (hsIPEK, hsKSN, hsPinblock) => {
  const key = dukpt._EDE3KeyExpand(dukpt._createPINKeyHex(hsIPEK, hsKSN))
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
