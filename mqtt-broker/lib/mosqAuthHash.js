'use strict'

/**
 * Mosquitto Auth Plugin Password Hash generation and Parsing
 *
 * See: https://github.com/jpmens/mosquitto-auth-plug#passwords
 */

const crypto = require('crypto')

module.exports.parsePasswordHash = (passwordHash) => {
  const passwordHashSplit = passwordHash.split('$')
  try {
    const hashComponent = {
      tag: passwordHashSplit[0],
      digest: passwordHashSplit[1].toLowerCase(),
      iter: parseInt(passwordHashSplit[2]),
      salt: Buffer.from(passwordHashSplit[3], 'ascii'),
      hash: Buffer.from(passwordHashSplit[4], 'base64')
    }
    if (hashComponent.tag === 'PBKDF2') return hashComponent
  } catch (err) {}
}

module.exports.checkPassword = (password, passwordHash) => {
  return new Promise((resolve, reject) => {
    const hash = exports.parsePasswordHash(passwordHash)
    if (!hash) return
    crypto.pbkdf2(
      password,
      hash.salt,
      hash.iter,
      hash.hash.length,
      hash.digest,
      (err, key) => {
        if (err) return reject(err)
        resolve(crypto.timingSafeEqual(key, hash.hash))
      })
  })
}

module.exports.hashPassword = (password, iter = 100) => {
  const digest = 'sha256'
  const keyLength = 24
  const salt = crypto.randomBytes(18).toString('base64')

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iter, keyLength, digest, (err, key) => {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        resolve('PBKDF2' + '$' + digest + '$' + iter + '$' + salt + '$' + key.toString('base64'))
      }
    })
  })
}
