'use strict'

/**
 * Card library
 * Mix and match module to works with Card/EMV/ISO/Banking
 */

const moment = require('moment')
const berTlv = require('ber-tlv')
const berTlvAnnotations = require('ber-tlv-annotations')
const berTlvRegistry = new berTlvAnnotations.AnnotationRegistry()
berTlvRegistry.registerPackagedProviders()

const hash = require('libs/hash')

/**
 * Expose all module
 */
module.exports.berTlv = berTlv
module.exports.berTlvAnnotations = berTlvAnnotations

/**
 * POS (Point of Sale) entry mode constant
 *
 * see : https://en.wikipedia.org/wiki/ISO_8583#Point_of_service_entry_modes
 */
module.exports.posEntryMode = {
  MAGSTRIPE_UNKNOWN_PIN: '020',
  MAGSTRIPE_WITH_PIN: '021',
  MAGSTRIPE_WITHOUT_PIN: '022',

  CHIP_UNKNOWN_PIN: '050',
  CHIP_WITH_PIN: '051',
  CHIP_WITHOUT_PIN: '052',

  MAGSTRIPE_NO_ALTERATION_UNKNOWN_PIN: '090',
  MAGSTRIPE_NO_ALTERATION_WITH_PIN: '091',
  MAGSTRIPE_NO_ALTERATION_WITHOUT_PIN: '092'
}

/**
 * PAN entry mode constant
 *
 * see : https://en.wikipedia.org/wiki/ISO_8583#Point_of_service_entry_modes
 */
module.exports.panEntryMode = {
  UNKNOWN: '00',
  MANUAL: '01',
  MAGSTRIPE: '02',
  CHIP: '05'
}

/**
 * PIN entry mode constant
 *
 * see : https://en.wikipedia.org/wiki/ISO_8583#Point_of_service_entry_modes
 */
module.exports.pinEntryMode = {
  UNKNOWN: '0',
  PIN: '1',
  NO_PIN: '2'
}

/**
 * List of EMV tags constant, based on binaryfoo emv-bertlv library
 *
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
  NON_TLV_RESPONSE_TEMPLATE: '80',
  TRANSACTION_CERTIFICATE_HASH: '98'
}

/**
 * Get PAN entry mode from POS entry mode
 */
module.exports.getPANEntryMode = (posEntryMode) => {
  return posEntryMode.substring(0, 2)
}

/**
 * Get PIN entry mode from POS entry mode
 */
module.exports.getPINEntryMode = (posEntryMode) => {
  return posEntryMode.slice(-1)
}

/**
 * Search value from TLV list (an array)
 */
module.exports.tlvValueFind = (tlvList, tag, toHexString = true) => {
  for (let i = 0; i < tlvList.length; i++) {
    if (tlvList[i].tag === tag) {
      if (toHexString) {
        return tlvList[i].value.toString('hex').toUpperCase() || null
      } else {
        return tlvList[i].value
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
module.exports.tlvDecode = (hsTlv, toTlvMap = false) => {
  return berTlv.TlvFactory.parse(hsTlv)
}

/**
 * Annotate current TLV object
 */
module.exports.tlvAnnotate = (tlvAnnotate) => {
  return berTlvRegistry.lookupAnnotation(tlvAnnotate)
}

/**
 * Replace '=' symbol with 'D' in Track2, to be compatible with EMV TLV
 */
module.exports.track2RemoveSymbol = (hsTrack2) => {
  return hsTrack2.replace('=', 'D')
}

/**
 * Replace 'D' symbol with '=' in Track2
 */
module.exports.track2AddSymbol = (hsTrack2) => {
  return hsTrack2.replace('D', '=')
}

/**
 * Get PAN from track2
 */
module.exports.track2GetPan = (hsTrack2) => {
  let separatorPos = hsTrack2.indexOf('D')
  if (separatorPos === -1) separatorPos = hsTrack2.indexOf('=')
  return hsTrack2.substring(0, separatorPos)
}

/**
 * Get Expiration Date from track2
 */
module.exports.track2GetExpirationDate = (hsTrack2) => {
  let separatorPos = hsTrack2.indexOf('D')
  if (separatorPos === -1) separatorPos = hsTrack2.indexOf('=')
  return hsTrack2.substring(separatorPos + 1, (separatorPos + 1) + 4)
}

/**
 * Get Service Code from track2
 */
module.exports.track2GetServiceCode = (hsTrack2) => {
  let separatorPos = hsTrack2.indexOf('D')
  if (separatorPos === -1) separatorPos = hsTrack2.indexOf('=')
  return hsTrack2.substring(separatorPos + 5, (separatorPos + 5) + 3)
}

/**
 * Get known (and PCI-safe) component of track2
 */
module.exports.track2GetComponent = (hsTrack2) => {
  const pan = exports.track2GetPan(hsTrack2)
  const expirationDate = exports.track2GetExpirationDate(hsTrack2)
  const first6 = pan.slice(0, 6)
  const last4 = pan.slice(-4)
  const truncatedPan = `${first6}*${last4}`
  const hashedPan = hash.hash(pan)

  return {
    pan,
    hashedPan,
    truncatedPan,
    first6,
    last4,
    expirationDate,
    expirationDateValid: moment(expirationDate, 'yymm').isBefore(moment())
  }
}

/**
 * Get known component of track2
 */
module.exports.track2FromComponent = (track2Component) => {
  return `${track2Component.pan || ''}=${track2Component.expirationDate || ''}${track2Component.serviceCode || ''}`
}

/**
 * Generate Format 0 (ISO-0) Pinblock
 * For more information see: https://www.eftlab.com/knowledge-base/261-complete-list-of-pin-blocks-in-payments/
 */
module.exports.generateISO0Pinblock = (hsPan, hsPin) => {
  const pinBlockPAN = `0000${hsPan.substring(3, 15)}`
  const pinBlockPIN = (`${String(hsPin.length).padStart(2, '0')}${hsPin}`).padEnd(16, 'f')

  const pinBlockPANBuffer = Buffer.from(pinBlockPAN, 'hex')
  const pinBlockPINBuffer = Buffer.from(pinBlockPIN, 'hex')

  const pinBlockBuffer = Buffer.alloc(pinBlockPINBuffer.length)

  for (let i = 0; i < pinBlockBuffer.length; i++) {
    pinBlockBuffer[i] = pinBlockPANBuffer[i] ^ pinBlockPINBuffer[i]
  }

  return pinBlockBuffer.toString('hex').toUpperCase()
}

/**
 * Get Pin from Format 0 (ISO-0) Pinblock
 * For more information see: https://www.eftlab.com/knowledge-base/261-complete-list-of-pin-blocks-in-payments/
 */
module.exports.getPinFromISO0Pinblock = (hsPinblock, hsPan) => {
  const pinBlockBuffer = Buffer.from(hsPinblock, 'hex')

  const pinBlockPAN = `0000${hsPan.substring(3, 15)}`
  const pinBlockPANBuffer = Buffer.from(pinBlockPAN, 'hex')

  for (let i = 0; i < pinBlockBuffer.length; i++) {
    pinBlockBuffer[i] = pinBlockBuffer[i] ^ pinBlockPANBuffer[i]
  }

  const pinHs = pinBlockBuffer.toString('hex')
  const pinLength = Number(pinHs.slice(0, 2))

  return pinHs.slice(2).slice(0, pinLength)
}
