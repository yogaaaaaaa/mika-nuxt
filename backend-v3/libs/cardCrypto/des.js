'use strict'

const crypto = require('crypto')

/**
 * 3DES - no padding, Single, Double and Triple length
 * Cipher using nodejs crypto
 */
function desCipher (key, msg, encryption = true, cbc = false, iv = null) {
  if (!Buffer.isBuffer(key) || !Buffer.isBuffer(msg)) {
    throw Error('key and msg must be a Buffer type')
  }

  if ((msg.length % 8) !== 0) {
    throw Error('msg length must be multiple of 8 bytes')
  }

  let cipherAlg
  if (key.length === 8) {
    if (cbc) {
      cipherAlg = 'des-cbc'
    } else {
      cipherAlg = 'des-ecb'
    }
  } else if (key.length === 16) {
    if (cbc) {
      cipherAlg = 'des-ede-cbc'
    } else {
      cipherAlg = 'des-ede-ecb'
    }
  } else if (key.length === 24) {
    if (cbc) {
      cipherAlg = 'des-ede3-cbc'
    } else {
      cipherAlg = 'des-ede3-ecb'
    }
  } else {
    throw Error('msg length must be in 8, 16, or 24 bytes')
  }

  if (cbc && !iv) {
    iv = Buffer.alloc(8, 0x00)
  }

  let cipher
  if (encryption) {
    cipher = crypto.createCipheriv(cipherAlg, key, iv)
  } else {
    cipher = crypto.createDecipheriv(cipherAlg, key, iv)
  }
  cipher.setAutoPadding(false)

  return Buffer.concat([cipher.update(msg), cipher.final()])
}

/**
 * 3DES ECB Encrypt with keying options based on key length
 */
module.exports.encrypt = (hsKey, hsMsg, cbc = false, hsIv) => {
  const result = desCipher(
    Buffer.from(hsKey, 'hex'),
    Buffer.from(hsMsg, 'hex'),
    true
  )
  return (result.toString('hex')).toUpperCase()
}

/**
 * 3DES ECB Decrypt with keying options based on key length
 */
module.exports.decrypt = (hsKey, hsMsg, cbc = false, hsIv) => {
  const result = desCipher(
    Buffer.from(hsKey, 'hex'),
    Buffer.from(hsMsg, 'hex'),
    false
  )
  return (result.toString('hex')).toUpperCase()
}

/**
 * 3DES CBC Encrypt with keying options based on key length
 */
module.exports.encryptCbc = (hsKey, hsMsg, hsIv) => {
  const result = desCipher(
    Buffer.from(hsKey, 'hex'),
    Buffer.from(hsMsg, 'hex'),
    true,
    true,
    hsIv ? Buffer.from(hsIv, 'hex') : null
  )
  return (result.toString('hex')).toUpperCase()
}

/**
 * 3DES CBC Decrypt with keying options based on key length
 */
module.exports.decryptCbc = (hsKey, hsMsg, hsIv) => {
  const result = desCipher(
    Buffer.from(hsKey, 'hex'),
    Buffer.from(hsMsg, 'hex'),
    false,
    true,
    hsIv ? Buffer.from(hsIv, 'hex') : null
  )
  return (result.toString('hex')).toUpperCase()
}

/**
 * 3DES CBC Single Block KCV check
 */
module.exports.validateKcv = (hsKey, hsKcv) => {
  const result = desCipher(
    Buffer.from(hsKey, 'hex'),
    Buffer.alloc(8, 0x00),
    true
  )
  return (result.toString('hex')).slice(0, 8).toUpperCase() === hsKcv.toUpperCase()
}
