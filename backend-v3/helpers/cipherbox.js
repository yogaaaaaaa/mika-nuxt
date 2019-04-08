'use strict'

/**
 * Cipherbox (cb), store ciphertext and its metadata in a JSON
 *
 * Designed to be transparently used as middleware in MIKA-API environment
 *
 * Defined version (so far),
 * cb0 : Plain old encryption using aes-256-cbc encryption and hmac-sha256 for authentication
 * cb1 : Hybrid cryptosystem, using RSA to create session key for aes-256-cbc encryption with hmac-sha256 for authentication
 * cb2 : DUKPT with IPEK and KSN (20 bit counter) with aes-256-cbc and hmac-sha256 for authentication (implemented soon)
 * cb3 : hmac-sha256 key generation with aes-256-cbc and hmac-sha256 for authentication
 *
 * Implementation Note :
 *
 * Most crypto setting is using nodejs default, see :
 * https://nodejs.org/api/crypto.html
 *
 * nodejs crypto implementation is using OpenSSL, so refer to OpenSSL about compatibility :
 * https://wiki.openssl.org/index.php/Main_Page
 *
 * cb1 is created based on this :
 * https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.3.0/com.ibm.zos.v2r3.csfb500/edrsa.htm
 *
 * On RSA Padding for cb1, fortunately nodejs crypto is using 'good' default :
 * https://paragonie.com/blog/2016/12/everything-you-know-about-public-key-encryption-in-php-is-wrong#php-openssl-rsa-bad-default
 *
 * Authenticated Encryption, see here:
 * https://en.wikipedia.org/wiki/Authenticated_encryption
 *
 */

const crypto = require('crypto')

function getUnixTimestamp () {
  return String(Math.floor(Date.now() / 1000))
}

const timestampTolerance = 1500

module.exports.cbType = {
  cb0: 'cb0',
  cb1: 'cb1',
  cb2: 'cb2',
  cb3: 'cb3'
}

/**
 * cb0 : Simple encryption using aes-256-cbc encryption and sha256 hmac
 */
module.exports.sealBoxWithCB0 = (data, key, id = null) => {
  try {
    let iv = crypto.randomBytes(16)
    let cipherData = crypto.createCipheriv('aes-256-cbc', key, iv)
    let dataEncrypted = Buffer.concat([cipherData.update(data), cipherData.final()])

    let timestamp = getUnixTimestamp()

    let hmacKey = crypto.createHash('sha256').update(Buffer.concat([key, Buffer.from(timestamp)])).digest()
    let dataEncryptedHmac = crypto.createHmac('sha256', hmacKey).update(dataEncrypted).digest('hex')

    let cipherBox = {
      cbx: exports.cbType.cb0,
      ts: timestamp,
      iv: iv.toString('base64'),
      data: dataEncrypted.toString('base64'),
      hmac: dataEncryptedHmac
    }

    if (id) {
      cipherBox.id = id
    }

    return {
      sessionKey: key,
      box: cipherBox
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

/**
 * cb1 : Hybrid cryptosystem, using RSA to encrypt session key for aes-256-cbc symmetric encryption with hmac-sha256 for authentication
 */
module.exports.sealBoxWithCB1 = (data, key, keyType = 'public', id = null) => {
  try {
    let sessionKey = null
    let encryptedSessionKey = null
    if (keyType === 'private' || keyType === 'public') {
      sessionKey = crypto.randomBytes(32)
      encryptedSessionKey = (
        keyType === 'private'
          ? crypto.privateEncrypt(key, sessionKey)
          : crypto.publicEncrypt(key, sessionKey)
      )
    } else {
      return null
    }

    let iv = crypto.randomBytes(16)
    let cipherData = crypto.createCipheriv('aes-256-cbc', sessionKey, iv)
    let dataEncrypted = Buffer.concat([cipherData.update(data), cipherData.final()])

    let timestamp = getUnixTimestamp()

    let hmacKey = crypto.createHash('sha256').update(Buffer.concat([sessionKey, Buffer.from(timestamp)])).digest()
    let dataEncryptedHmac = crypto.createHmac('sha256', hmacKey).update(dataEncrypted).digest('hex')

    let cipherBox = {
      cbx: exports.cbType.cb1,
      ts: timestamp,
      pk: keyType,
      iv: iv.toString('base64'),
      key: encryptedSessionKey.toString('base64'),
      hmac: dataEncryptedHmac,
      data: dataEncrypted.toString('base64')
    }

    if (id) {
      cipherBox.id = id
    }

    return {
      sessionKey: sessionKey,
      box: cipherBox
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

/**
 * cb2 : DUKPT (ipek and ksn) with aes-256-cbc with hmac-sha256 (implemented soon)
 */
module.exports.sealBoxWithCB2 = (data, ipek, baseKSN, id = null) => {
  // not implemented lol
  return null
}

/**
 * cb3 : Hmac with sha256 digest for key generation, aes-256-cbc encryption and hmac-sha256 for authentication
 */
module.exports.sealBoxWithCB3 = (data, key, id = null, iter = 100) => {
  try {
    let salt = crypto.randomBytes(64)
    let sessionKey = crypto.createHmac('sha256', key).update(salt).digest()

    let iv = crypto.randomBytes(16)
    let cipherData = crypto.createCipheriv('aes-256-cbc', sessionKey, iv)
    let dataEncrypted = Buffer.concat([cipherData.update(data), cipherData.final()])

    let timestamp = getUnixTimestamp()

    let hmacKey = crypto.createHash('sha256').update(Buffer.concat([sessionKey, Buffer.from(timestamp)])).digest()
    let dataEncryptedHmac = crypto.createHmac('sha256', hmacKey).update(dataEncrypted).digest('hex')

    let cipherBox = {
      cbx: exports.cbType.cb3,
      ts: timestamp,
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      hmac: dataEncryptedHmac,
      data: dataEncrypted.toString('base64')
    }

    if (id) {
      cipherBox.id = id
    }

    return {
      sessionKey: sessionKey,
      box: cipherBox
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

module.exports.openCB0Box = (box, key, tsCheck = true) => {
  try {
    if (!box.cbx) {
      return null
    }

    if (box.cbx === exports.cbType.cb0 && Math.abs(getUnixTimestamp() - parseInt(box.ts)) < timestampTolerance) {
      let encryptedData = Buffer.from(box.data, 'base64')
      let hmacKey = crypto.createHash('sha256')
        .update(
          Buffer.concat([key, Buffer.from(String(box.ts))])
        )
        .digest()
      let encryptedDataHMAC = crypto.createHmac('sha256', hmacKey).update(encryptedData).digest()

      if (crypto.timingSafeEqual(encryptedDataHMAC, Buffer.from(box.hmac, 'hex'))) {
        let dataDecipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(box.iv, 'base64'))
        return {
          key: key,
          data: Buffer.concat([dataDecipher.update(encryptedData), dataDecipher.final()])
        }
      }
    }
  } catch (error) {
    console.log(error)
  }

  return null
}

module.exports.openCB1Box = (box, key, keyType = 'private', tsCheck = true) => {
  try {
    if (!box.cbx) {
      return null
    }

    if (box.cbx === exports.cbType.cb1 && Math.abs(getUnixTimestamp() - parseInt(box.ts)) < timestampTolerance) {
      let encryptedSessionKey = Buffer.from(box.key, 'base64')
      let sessionKey = null
      if ((box.pk === 'private' && keyType === 'public')) {
        sessionKey = crypto.publicDecrypt(key, encryptedSessionKey)
      } else if (box.pk === 'public' && keyType === 'private') {
        sessionKey = crypto.privateDecrypt(key, encryptedSessionKey)
      } else {
        return null
      }

      let encryptedData = Buffer.from(box.data, 'base64')

      let hmacKey = crypto.createHash('sha256')
        .update(
          Buffer.concat([sessionKey, Buffer.from(String(box.ts))])
        )
        .digest()
      let encryptedDataHMAC = crypto.createHmac('sha256', hmacKey).update(encryptedData).digest()

      if (crypto.timingSafeEqual(encryptedDataHMAC, Buffer.from(box.hmac, 'hex'))) {
        let dataDecipher = crypto.createDecipheriv('aes-256-cbc', sessionKey, Buffer.from(box.iv, 'base64'))
        return {
          key: sessionKey,
          data: Buffer.concat([dataDecipher.update(encryptedData), dataDecipher.final()])
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
  return null
}

module.exports.openCB2Box = (box, keyIPEK, baseKSN, tsCheck = true) => {
  // not implemented lol
  return null
}

module.exports.openCB3Box = (box, key) => {
  try {
    if (!box.cbx) {
      return null
    }

    if (box.cbx === exports.cbType.cb3 && Math.abs(getUnixTimestamp() - parseInt(box.ts)) < timestampTolerance) {
      let sessionKey = crypto.createHmac('sha256', key).update(Buffer.from(box.salt, 'base64')).digest()

      let encryptedData = Buffer.from(box.data, 'base64')

      let hmacKey = crypto.createHash('sha256')
        .update(
          Buffer.concat([sessionKey, Buffer.from(String(box.ts))])
        )
        .digest()
      let encryptedDataHMAC = crypto.createHmac('sha256', hmacKey).update(encryptedData).digest()

      if (crypto.timingSafeEqual(encryptedDataHMAC, Buffer.from(box.hmac, 'hex'))) {
        let dataDecipher = crypto.createDecipheriv('aes-256-cbc', sessionKey, Buffer.from(box.iv, 'base64'))
        return {
          key: sessionKey,
          data: Buffer.concat([dataDecipher.update(encryptedData), dataDecipher.final()])
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
  return null
}

module.exports.generateCb1Key = async () => {
  const id = crypto.randomBytes(20).toString('hex')

  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  })

  return {
    cbkeyClient: {
      id,
      cbx: 'cb1',
      keyType: 'private',
      key: keyPair.privateKey
    },
    cbkeyServer: {
      id,
      cbx: 'cb1',
      keyType: 'public',
      key: keyPair.publicKey
    }
  }
}

module.exports.generateCb3Key = async () => {
  return {
    id: crypto.randomBytes(20).toString('hex'),
    cbx: 'cb3',
    key: crypto.randomBytes(64).toString('base64')
  }
}
