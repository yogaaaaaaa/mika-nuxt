'use strict'

/**
 * Cipherbox, a encryption container using JSON as serialization
 * format.
 *
 * Defined version (so far),
 *
 * cb0 : Plain old AES symmetric encryption. Uses aes-256-cbc cipher
 * with hmac-sha256 encrypt-then-mac scheme for authenticated encryption.
 *
 * cb1 : Same as cb0. Session key is generated using hmac-sha256
 * with randomly generated salt
 *
 * cb2 : Same as cb0. Session key is randomly generated and encrypted using RSA.
 * Basically a poor man's TLS. Please USE TLS if possible !
 *
 *
 * Some implementation Note :
 *
 * Key Derivation Recommendation by NIST
 * https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-56Cr1.pdf
 *
 * FIPS approved hash
 * https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
 *
 * Most crypto setting is using nodejs default, see :
 * https://nodejs.org/api/crypto.html
 *
 * nodejs crypto implementation is using OpenSSL, so refer to OpenSSL about compatibility :
 * https://wiki.openssl.org/index.php/Main_Page
 *
 * cb2 is created based on this :
 * https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.3.0/com.ibm.zos.v2r3.csfb500/edrsa.htm
 *
 * On RSA Padding for cb2, fortunately nodejs crypto is using 'good' default :
 * https://paragonie.com/blog/2016/12/everything-you-know-about-public-key-encryption-in-php-is-wrong#php-openssl-rsa-bad-default
 *
 * More about encrypt-then-mac
 * https://proandroiddev.com/security-best-practices-symmetric-encryption-with-aes-in-java-and-android-part-2-b3b80e99ad36
 *
 * Authenticated Encryption, see here:
 * https://en.wikipedia.org/wiki/Authenticated_encryption
 * https://security.stackexchange.com/questions/37880/why-cant-i-use-the-same-key-for-encryption-and-mac
 * https://crypto.stackexchange.com/questions/8081/using-the-same-secret-key-for-encryption-and-authentication-in-a-encrypt-then-ma
 *
 * Length Extension attack
 * https://en.wikipedia.org/wiki/Length_extension_attack
 * https://crypto.stackexchange.com/questions/1070/why-is-hk-mathbin-vert-x-not-a-secure-mac-construction
 *
 * No known problem of using same key in encrypt-then-mac
 * https://crypto.stackexchange.com/questions/8081/using-the-same-secret-key-for-encryption-and-authentication-in-a-encrypt-then-ma/8086#8086
 *
 * IV must be authenticated
 * https://crypto.stackexchange.com/questions/24353/encrypt-then-mac-do-i-need-to-authenticate-the-iv
 *
 * Timestamp in Hmac on every cipherbox is needed to prevent replay attack
 *
 */

const crypto = require('crypto')
const ksuid = require('ksuid')

const defaultTsTolerance = 60

function getUnixTimestamp () {
  return String(Math.floor(Date.now() / 1000))
}

function commonCb0Encryption (data, key, cbType, id) {
  const timestamp = getUnixTimestamp()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const dataEncrypted = Buffer.concat([cipher.update(data), cipher.final()])
  const hmacKey = crypto.createHash('sha256')
    .update(key)
    .digest()
  const hmac = crypto.createHmac('sha256', hmacKey)
    .update(dataEncrypted)
    .update(iv)
    .update(Buffer.from(id || '0'))
    .update(Buffer.from(cbType))
    .update(Buffer.from(timestamp))
    .digest()

  return {
    t: timestamp,
    i: iv.toString('base64'),
    h: hmac.toString('base64'),
    d: dataEncrypted.toString('base64')
  }
}

function commonCb0Decryption (box, key, tsTolerance) {
  if (
    tsTolerance &&
    !(Math.abs(getUnixTimestamp() - parseInt(box.t)) < tsTolerance)
  ) return

  const iv = Buffer.from(box.i, 'base64')
  const encryptedData = Buffer.from(box.d, 'base64')
  const hmacKey = crypto.createHash('sha256')
    .update(key)
    .digest()
  const hmac = crypto.createHmac('sha256', hmacKey)
    .update(encryptedData)
    .update(iv)
    .update(Buffer.from(box.id || '0'))
    .update(Buffer.from(box.cb))
    .update(Buffer.from(box.t))
    .digest()

  if (crypto.timingSafeEqual(hmac, Buffer.from(box.h, 'base64'))) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    return {
      key,
      data: Buffer.concat([decipher.update(encryptedData), decipher.final()])
    }
  }
}

module.exports.cbTypes = {
  cb0: 'cb0',
  cb1: 'cb1',
  cb2: 'cb2'
}

module.exports.cb2KeyTypes = {
  PRIVATE: 'prv',
  PUBLIC: 'pub'
}

module.exports.keyStatuses = {
  CREATED: 'created',
  ACTIVATED: 'activated'
}

module.exports.createCb0 = ({
  id = undefined,
  data,
  key
}) => {
  try {
    const cipherBox = {
      id,
      cb: exports.cbTypes.cb0,
      ...commonCb0Encryption(data, key, exports.cbTypes.cb0, id)
    }

    return {
      sessionKey: key,
      box: cipherBox
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports.openCb0 = ({
  box,
  key,
  tsTolerance = defaultTsTolerance
}) => {
  try {
    if (box.cb !== exports.cbTypes.cb0) return

    return commonCb0Decryption(box, key, tsTolerance)
  } catch (error) {
    console.error(error)
  }
}

module.exports.generateCb0Key = async () => {
  return {
    id: (await ksuid.random()).string,
    cbk: exports.cbTypes.cb0,
    k: crypto.randomBytes(32).toString('base64')
  }
}

module.exports.createCb1 = ({
  id = undefined,
  data,
  key
}) => {
  try {
    const salt = crypto.randomBytes(64)
    const sessionKey = crypto.createHmac('sha256', key)
      .update(salt)
      .digest()

    const cipherBox = {
      id,
      cb: exports.cbTypes.cb1,
      s: salt.toString('base64'),
      ...commonCb0Encryption(data, sessionKey, exports.cbTypes.cb1, id)
    }

    return {
      sessionKey,
      box: cipherBox
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports.openCb1 = ({
  box,
  key,
  tsTolerance = defaultTsTolerance
}) => {
  try {
    if (box.cb !== exports.cbTypes.cb1) return

    const sessionKey = crypto.createHmac('sha256', key)
      .update(Buffer.from(box.s, 'base64'))
      .digest()

    return commonCb0Decryption(box, sessionKey, tsTolerance)
  } catch (error) {
    console.error(error)
  }
}

module.exports.generateCb1Key = async () => {
  return {
    id: await (ksuid.random()).string,
    cbk: exports.cbTypes.cb1,
    k: crypto.randomBytes(64).toString('base64')
  }
}

module.exports.createCb2 = ({
  id = undefined,
  data,
  key,
  keyType = exports.cb2KeyTypes.PUBLIC
}) => {
  try {
    let sessionKey
    let encryptedSessionKey
    if (
      keyType === exports.cb2KeyTypes.PRIVATE ||
      keyType === exports.cb2KeyTypes.PUBLIC
    ) {
      sessionKey = crypto.randomBytes(32)
      encryptedSessionKey = (keyType === exports.cb2KeyTypes.PRIVATE)
        ? crypto.privateEncrypt(key, sessionKey)
        : crypto.publicEncrypt(key, sessionKey)
    } else {
      return
    }

    const cipherBox = {
      id,
      cb: exports.cbTypes.cb2,
      kt: keyType,
      ek: encryptedSessionKey.toString('base64'),
      ...commonCb0Encryption(data, sessionKey, exports.cbTypes.cb2, id)
    }

    return {
      sessionKey,
      box: cipherBox
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports.openCb2 = ({
  box,
  key,
  keyType = exports.cb2KeyTypes.PRIVATE,
  tsTolerance = defaultTsTolerance
}) => {
  try {
    if (box.cb !== exports.cbTypes.cb2) return

    const encryptedSessionKey = Buffer.from(box.ek, 'base64')
    let sessionKey
    if (
      keyType === exports.cb2KeyTypes.PRIVATE &&
      box.kt === exports.cb2KeyTypes.PUBLIC
    ) {
      sessionKey = crypto.privateDecrypt(key, encryptedSessionKey)
    } else if (
      keyType === exports.cb2KeyTypes.PUBLIC &&
      box.kt === exports.cb2KeyTypes.PRIVATE
    ) {
      sessionKey = crypto.publicDecrypt(key, encryptedSessionKey)
    } else {
      return
    }

    return commonCb0Decryption(box, sessionKey, tsTolerance)
  } catch (error) {
    console.error(error)
  }
}

module.exports.generateCb2Key = async () => {
  const id = await (ksuid.random()).string

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
    private: {
      id,
      cbk: exports.cbTypes.cb2,
      kt: exports.cb2KeyTypes.PRIVATE,
      k: keyPair.privateKey
    },
    public: {
      id,
      cbk: exports.cbTypes.cb2,
      kt: exports.cb2KeyTypes.PUBLIC,
      k: keyPair.publicKey
    }
  }
}

module.exports.create = (data, keyBox) => {
  if (keyBox.cbk === exports.cbTypes.cb0) {
    return exports.createCb0({
      id: keyBox.id,
      data,
      key: Buffer.from(keyBox.k, 'base64')
    })
  } else if (keyBox.cbk === exports.cbTypes.cb1) {
    return exports.createCb1({
      id: keyBox.id,
      data,
      key: Buffer.from(keyBox.k, 'base64')
    })
  } else if (keyBox.cbk === exports.cbTypes.cb2) {
    return exports.createCb2({
      id: keyBox.id,
      data,
      keyType: keyBox.kt,
      key: Buffer.from(keyBox.k, 'base64')
    })
  }
}

module.exports.open = (box, keyBox, tsTolerance = defaultTsTolerance) => {
  if (keyBox.cbx === exports.cbTypes.cb0) {
    return exports.openCb0({
      box,
      key: Buffer.from(keyBox.k, 'base64'),
      tsTolerance
    })
  } else if (keyBox.cbx === exports.cbTypes.cb1) {
    return exports.openCb1({
      box,
      key: Buffer.from(keyBox.k, 'base64'),
      tsTolerance
    })
  } else if (keyBox.cbx === exports.cbTypes.cb2) {
    return exports.openCb2({
      box,
      key: keyBox.k,
      keyType: keyBox.kt,
      tsTolerance
    })
  }
}
