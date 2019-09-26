'use strict'

/**
 * Encapsulate hash implementation
 */

const crypto = require('crypto')
const bcrypt = require('bcrypt')

module.exports.hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex')
}

module.exports.bcryptHash = async (data, salt = 10) => {
  return bcrypt.hash(data, bcrypt.genSaltSync(salt))
}

module.exports.compareBcryptHash = async (dataHashed, data) => {
  return bcrypt.compare(data, dataHashed)
}

module.exports.compareString = (dataA, dataB) => {
  crypto.timingSafeEqual(Buffer.from(dataA), Buffer.from(dataB))
}

module.exports.compareHash = (dataHashed, data) => {
  const dataHashA = crypto.createHash('sha256').update(data).digest()
  const dataHashB = Buffer.from(dataHashed, 'hex')
  return crypto.timingSafeEqual(dataHashA, dataHashB)
}
