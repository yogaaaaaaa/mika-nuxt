'use strict'

/**
 * External API auth implementation
 */

const crypto = require('crypto')

const models = require('../models')
const redis = require('./redis')

const jwt = require('jsonwebtoken')
const hash = require('./hash')

const extApiConfig = require('../configs/extApiConfig')

async function getApiKey (idKey) {
  let apiKey = null
  const redisKeyName = `extApiAuth:${idKey}`

  try {
    apiKey = JSON.parse(await redis.get(redisKeyName))
  } catch (err) {
    console.err(err)
  }

  if (!apiKey) {
    apiKey = await models.apiKey.scope('excludeTimestamp').findOne({
      where: {
        idKey
      }
    })
    if (!apiKey) return
    apiKey = apiKey.toJSON()
    apiKey.apiKeyId = apiKey.id
    delete apiKey.id
  }

  await redis.set(
    redisKeyName,
    JSON.stringify(apiKey),
    'px',
    extApiConfig.tokenTimeout
  )

  return apiKey
}

module.exports.createKey = async (partnerId) => {
  const idKey = crypto.randomBytes(extApiConfig.idKeyLength).toString(extApiConfig.idKeyEncoding)
  const secretKey = crypto.randomBytes(extApiConfig.secretKeyLength).toString(extApiConfig.secretKeyEncoding)
  const secretKeyHashed = hash.hash(secretKey)
  const sharedKey = crypto.randomBytes(extApiConfig.sharedKeyLength).toString(extApiConfig.sharedKeyEncoding)

  return {
    idKey: idKey,
    secretKey: secretKey,
    secretKeyHashed: secretKeyHashed,
    sharedKey: sharedKey
  }
}

module.exports.createServerToken = async (idKey, payload) => {
  const tokenPayload = {
    keyId: idKey,
    payloadSHA256: crypto.createHash('sha256').update(payload).digest('hex')
  }

  const apiKey = await getApiKey(idKey)
  if (apiKey) {
    return jwt.sign(tokenPayload, apiKey.sharedKey)
  }
}

module.exports.createClientToken = async (idKey, secretKey, sharedKey) => {
  return jwt.sign({
    keyId: idKey,
    keySecret: secretKey
  }, sharedKey)
}

module.exports.verifyClientToken = async (tokenString) => {
  try {
    const tokenPayload = jwt.decode(tokenString)

    if (!tokenPayload.iat) return
    if (Math.abs((new Date().getTime()) - (tokenPayload.iat * 1000)) > extApiConfig.tokenTimeout) return

    const apiKey = await getApiKey(tokenPayload.keyId)

    if (!apiKey) return
    if (!hash.compareHash(apiKey.secretKey, tokenPayload.keySecret)) return

    jwt.verify(tokenString, apiKey.sharedKey)

    return apiKey
  } catch (err) {
    console.error(err)
  }
}
