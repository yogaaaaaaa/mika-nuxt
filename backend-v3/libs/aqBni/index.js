'use strict'

/**
 * Library to work with bni acquirer, with help of FTIE middleware
 */
const moment = require('moment')
const card = require('libs/card')
const cardCrypto = require('libs/cardCrypto')
const ftie = require('libs/ftie')
const format = require('libs/format')
const constants = require('./constants')

const isEnvProduction = process.env.NODE_ENV === 'production'

module.exports.baseConfig = require('configs/aqBniConfig')
module.exports.responseCodes = constants.responseCodes
module.exports.handlerNameDebit = 'cardBniDebit'
module.exports.handlerNameCredit = 'cardBniCredit'
module.exports.terminalTypeName = 'terminalBni'

async function ftieNoTleRequest (config, body, retry = 1) {
  return ftie.request(`${config.ftieBaseUrl}/bni/notle`, body, retry)
}

async function ftieTleRequest (config, body, retry = 1) {
  return ftie.request(`${config.ftieBaseUrl}/bni/tle`, body, retry)
}

async function ftieRequest (config, body, retry = 1) {
  if (!isEnvProduction && config.disableTle) {
    return ftie.request(`${config.ftieBaseUrl}/bni/notle`, body, retry)
  }
  return ftie.request(`${config.ftieBaseUrl}/bni/tle`, body, retry)
}

function settlementDetail ({
  capture,
  totalAmount
}) {
  return Buffer.concat([
    Buffer.from(String(capture).padStart(3, '0')), // [capture card] number of debits sale withdrawal trx
    Buffer.from(format.decimalAmountPadded(totalAmount, 12)), // [capture card] amount of debits sale and withdrawal
    // Buffer.from(String(0).padStart(3, '0')), // [capture card] number of credits refund
    // Buffer.from(String(0).padStart(12, '0')), // [capture card] amount of credits refund

    // Buffer.from(String(0).padStart(3, '0')), // [debit card] number of debits sale and withdrawal
    // Buffer.from(String(0).padStart(12, '0')), // [debit card] amount of debits sale and withdrawal
    // Buffer.from(String(0).padStart(3, '0')), // [debit card] number of credits refund
    // Buffer.from(String(0).padStart(12, '0')), // [debit card] amount of credits refund

    // Buffer.from(String(0).padStart(3, '0')), // [authorize card] number of debits sale
    // Buffer.from(String(0).padStart(12, '0')), // [authorize card] amount of debits sale
    // Buffer.from(String(0).padStart(3, '0')), // [authorize card] number of credits refund
    // Buffer.from(String(0).padStart(12, '0')) // [authorize card] amount of credits refund

    Buffer.from(String(0).padStart(75, '0')) // padding to reach 90 bytes
  ])
}

function settlementTrxDetail ({
  mti = '0200',
  stan,
  rrn
}) {
  return Buffer.concat([
    Buffer.from(mti),
    Buffer.from(String(stan).padStart(6, '0')),
    Buffer.from(String(rrn).padStart(6, '0'))
  ])
}

function assignCommonBody (config, body) {
  config.currentMoment = moment()
  config.traceNumber = String(config.traceNumber)
  config.nii = String(config.nii)

  body = Object.assign(body || {}, {
    Options: {
      HostAddress: config.hostAddress,
      HostPort: config.hostPort,
      HostTimeout: config.hostTimeout,

      TpduNii: config.nii
    },
    Mti: config.mti,
    ProcessingCode: config.processingCode,
    TransmissionDateTime: config.currentMoment.toISOString(true), // convert to local time
    TraceNumber: config.traceNumber,
    TerminalID: config.tid,
    MerchantID: config.mid,
    Nii: config.nii
  })

  if (config.tle && config.tle.ltwkID) {
    body.TleOptions = {
      LtwkID: config.tle.ltwkID,
      TleAcquirerID: config.tle.acquirerID,
      LtwkDEK: config.tle.ltwkDek,
      LtwkMAK: config.tle.ltwkMak
    }
  }

  return body
}

function assignTransactionBody (config, body) {
  body = body || {}

  // parse emv
  if (config.emv) {
    config.emvTags = card.tlvDecode(config.emv)
    config.commonEmvTags = {
      app: card.tlvValueFind(config.emvTags, card.emvTags.APPLICATION_PREFERRED_NAME, false).toString('ascii'),
      aid: card.tlvValueFind(config.emvTags, card.emvTags.DEDICATED_FILE_NAME),
      tc: card.tlvValueFind(config.emvTags, card.emvTags.TRANSACTION_CERTIFICATE_HASH),
      tvr: card.tlvValueFind(config.emvTags, card.emvTags.TERMINAL_VERIFICATION_RESULTS),
      tsi: card.tlvValueFind(config.emvTags, card.emvTags.TSI)
    }
    config.track2 = card.tlvValueFind(config.emvTags, card.emvTags.TRACK_2_EQUIVALENT_DATA)
    config.appPan = card.tlvValueFind(config.emvTags, card.emvTags.PAN_SEQUENCE_NUMBER)
  }

  // parse track2
  if (config.track2) {
    const track2Component = card.track2GetComponent(config.track2)
    config.track2Component = track2Component

    config.track2 = card.track2RemoveSymbol(config.track2)
    config.pan = track2Component.pan
    config.expirationDate = track2Component.expirationDate
  }

  // app pan and pos code default
  config.posCode = config.posCode || '00'
  config.appPan = config.appPan || '000'

  // ecr default
  config.ecr = String(config.ecr).padStart(6, '0')

  // Get plain pin or pinblock
  if (config.pin) { // plain pinblock
    config.pinBlock = card.generateISO0Pinblock(config.pan, config.pin)
  } else if (config.standardPinBlock) { // mika standard pinblock, encrypted using sessionUserDek
    const standardPinKey = config.sessionUserDekBuffer.slice(0, 24).toString('hex')
    config.pinBlock = cardCrypto.des.decrypt(standardPinKey, config.standardPinBlock)
  } else if (config.doubleLengthPinBlock) { // double length pin block
    const doubleLengthPinKey = config.sessionUserDekBuffer.slice(0, 16).toString('hex')
    config.pinBlock = cardCrypto.des.decrypt(doubleLengthPinKey, config.doubleLengthPinBlock)
  }

  // Determining entry mode
  if (!config.entryMode) {
    if (config.emv) {
      if (config.pinBlock) {
        config.entryMode = card.posEntryMode.CHIP_WITH_PIN
      } else if (config.signature) {
        config.entryMode = card.posEntryMode.CHIP_WITHOUT_PIN
      } else {
        config.entryMode = card.posEntryMode.CHIP_UNKNOWN_PIN
      }
    } else if (config.track2) {
      if (config.pinBlock) {
        config.entryMode = card.posEntryMode.MAGSTRIPE_WITH_PIN
      } else if (config.signature) {
        config.entryMode = card.posEntryMode.MAGSTRIPE_WITHOUT_PIN
      } else {
        config.entryMode = card.posEntryMode.MAGSTRIPE_UNKNOWN_PIN
      }
    }
  }

  // Convert transaction date time to local time
  if (config.transactionDateTime) {
    config.transactionDateTime = moment(config.transactionDateTime).toISOString(true)
  }

  body.Pan = config.pan
  body.ExpirationDate = config.expirationDate
  if (config.pinBlock) {
    body.PinBlock = cardCrypto.des.encrypt(config.pinKey, config.pinBlock)
  }
  body.Amount = config.amount
  body.ReferenceNumber = config.reference
  body.ApprovalCode = config.authorizationReference
  body.TransactionDateTime = config.transactionDateTime
  body.ResponseCode = config.responseCode
  body.EntryMode = config.entryMode
  body.PosCode = config.posCode
  body.AppPan = config.appPan
  body.Track2 = config.track2
  body.EmvData = config.emv
  body.PrivateData62 = config.ecr
    ? Buffer.from(config.ecr).toString('hex')
    : undefined

  return body
}

function assignReverseBody (config, body) {
  body.Options.HostTimeout = Math.round(config.hostTimeout * 0.5)
}

function assignSettlementBody (config, body) {
  body.PrivateData60 = Buffer.from(String(config.batchNumber).padStart(6, '0')).toString('hex')
  body.PrivateData63 = settlementDetail({
    capture: config.countSettle,
    totalAmount: config.amountSettle
  }).toString('hex')
}

function assignBatchUploadBody (config, body) {
  body.PrivateData60 = settlementTrxDetail({
    stan: config.traceNumber,
    rrn: config.reference
  }).toString('hex')
}

module.exports.mixConfig = (config) => {
  const mixedConfig = Object.assign(
    {},
    exports.baseConfig, // default aqBni Config
    config
  )
  return mixedConfig
}

module.exports.sale = async (config) => {
  config.mti = '0200'
  config.processingCode = '000000'
  const body = assignCommonBody(config)
  assignTransactionBody(config, body)

  return ftieRequest(config, body)
}

module.exports.saleVoid = async (config) => {
  config.mti = '0200'
  config.processingCode = '020000'
  const body = assignCommonBody(config)
  assignTransactionBody(config, body)

  return ftieRequest(config, body)
}

module.exports.saleReverse = async (config) => {
  config.mti = '0400'
  config.processingCode = '000000' // sale processing code
  const body = assignCommonBody(config)
  assignTransactionBody(config, body)
  assignReverseBody(config, body)

  return ftieRequest(config, body, config.hostRetry)
}

module.exports.saleVoidReverse = async (config) => {
  config.mti = '0400'
  config.processingCode = '020000' // void sale processing code
  const body = assignCommonBody(config)
  assignTransactionBody(config, body)
  assignReverseBody(config, body)

  return ftieRequest(config, body, config.hostRetry)
}

module.exports.initialSettlement = async (config) => {
  config.mti = '0500'
  config.processingCode = '920000' // initial settlement
  const body = assignCommonBody(config)
  assignSettlementBody(config, body)

  return ftieRequest(config, body, config.hostSettlementRetry)
}

module.exports.finalSettlement = async (config) => {
  config.mti = '0500'
  config.processingCode = '960000' // final settlement
  const body = assignCommonBody(config)
  assignSettlementBody(config, body)

  return ftieRequest(config, body, config.hostSettlementRetry)
}

module.exports.batchUpload = async (config) => {
  config.mti = '0320'
  config.processingCode = '000000' // sale batch upload
  config.responseCode = '00' // only batch upload approved sale
  const body = assignCommonBody(config)
  assignTransactionBody(config, body)
  assignBatchUploadBody(config, body)

  return ftieRequest(config, body, config.hostSettlementRetry)
}

module.exports.downloadEncryptedLtmk = async (config) => {
  config.mti = '0800'
  config.processingCode = '970000'
  config.tle = null
  const body = assignCommonBody(config)
  const kekSamToken = Buffer.concat([
    Buffer.from('HTLE030', 'ascii'),
    Buffer.from(config.kekSamToken, 'hex')
  ])
  body.PrivateData62 = kekSamToken.toString('hex')

  const response = await ftieNoTleRequest(config, body)

  if (response && response.PrivateData62) {
    response.encryptedLtmk = response.PrivateData62.slice(-80)
  }

  return response
}

module.exports.downloadLtwk = async (config) => {
  config.mti = '0800'
  config.processingCode = '920000'
  const body = assignCommonBody(config)

  // LTWK download private data
  const ltwkRequest = Buffer.concat([
    Buffer.from('HTLE031', 'ascii'), // htle header (version and type)
    Buffer.from(String(config.tle.acquirerID).padStart(3, '0'), 'ascii'), // ltmk acquirer id
    Buffer.from(String(config.tle.acquirerID).padStart(3, '0'), 'ascii'), // acquirer id
    Buffer.from(String(config.tid), 'ascii'),
    Buffer.from(String(config.tle.vendorID).padStart(8, '0'), 'ascii'),
    Buffer.from(String(config.tle.ltmkID).padStart(4, '0'), 'ascii'),
    Buffer.from(String(config.tle.ltwkID || '0000').padStart(4, '0'), 'ascii')
  ])
  body.PrivateData62 = ltwkRequest.toString('hex')

  const response = await ftieNoTleRequest(config, body)

  if (response) {
    if (response.PrivateData62) {
      const data = response.PrivateData62
      const ltwkToken = {
        header: Buffer.from(data.slice(0, 14), 'hex').toString('ascii'),
        ltwkID: Buffer.from(data.slice(14, 22), 'hex').toString('ascii'),
        encryptedLtwkDek: data.slice(22, 54),
        encryptedLtwkMak: data.slice(54, 86),
        ltwkDek: undefined,
        ltwkMak: undefined,
        dekKcv: Buffer.from(data.slice(86, 102), 'hex').toString('ascii'),
        makKcv: Buffer.from(data.slice(102, 118), 'hex').toString('ascii'),
        dekKcvValid: undefined,
        makKcvValid: undefined,
        renewedAcquirerId: Buffer.from(data.slice(118, 124), 'hex').toString('ascii')
      }
      // decrypt dek
      ltwkToken.ltwkDek = cardCrypto.des.decryptCbc(config.tle.ltmk, ltwkToken.encryptedLtwkDek)
      ltwkToken.ltwkMak = cardCrypto.des.decryptCbc(config.tle.ltmk, ltwkToken.encryptedLtwkMak)
      // validate kcv
      ltwkToken.dekKcvValid = cardCrypto.des.validateKcv(ltwkToken.ltwkDek, ltwkToken.dekKcv)
      ltwkToken.makKcvValid = cardCrypto.des.validateKcv(ltwkToken.ltwkMak, ltwkToken.makKcv)

      response.ltwkToken = ltwkToken
    }
    if (response.PrivateData63) {
      response.downloadLtwkResponse = Buffer.from(response.PrivateData63, 'hex').toString('ascii')
    }
  }

  return response
}

module.exports.downloadMk = async (config) => {
  config.mti = '0100'
  config.processingCode = '860000'
  const body = assignCommonBody(config)

  const response = await ftieTleRequest(config, body)

  if (response && response.PrivateData58) {
    const tlvList = card.tlvDecode(response.PrivateData58)
    response.masterKey = tlvList[0].value.toString('hex')
  }
  return response
}

module.exports.downloadWk = async (config) => {
  config.mti = '0100'
  config.processingCode = '870000'
  const body = assignCommonBody(config)

  const response = await ftieTleRequest(config, body)

  if (response && response.PrivateData58) {
    const tlvList = card.tlvDecode(response.PrivateData58)
    response.workingKey = tlvList[0].value.toString('hex')
  }
  return response
}

module.exports.decodeLtmkToken = (decryptedLtmk) => {
  try {
    return {
      ltmkID: Buffer.from(decryptedLtmk.substring(0, 8), 'hex').toString('ascii'),
      ltmk: decryptedLtmk.substring(8, 40)
    }
  } catch (error) {}
}
