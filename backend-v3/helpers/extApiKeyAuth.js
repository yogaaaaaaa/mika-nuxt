'use strict'

/**
 * Provide functionality for Public API Authorization
 * for Public API
 */

const crypto = require('crypto')

const models = require('../models')
const redis = require('./redis')

const jwt = require('jsonwebtoken')
const hash = require('./hash')

const config = require('../configs/extApiAuth')

async function getCachedKeyData (keyId) {
  let keyData = null
  let redisKeyName = `${config.redisPrefix}:${keyId}`

  try {
    keyData = JSON.parse(await redis.get(redisKeyName))
  } catch (error) {
    keyData = null
  }

  if (!keyData) {
    keyData = (await models.api_key.findOne({
      attributes: { exclude: ['created_at', 'updated_at'] },
      include: [
        {
          model: models.entity_api_key,
          attributes: [ ['merchantId', 'merchantId'], ['terminalId', 'agentId'] ],
          as: 'entities'
        }
      ],
      where: {
        key_id: keyId,
        active: true
      }
    })).toJSON()

    if (!keyData) {
      return null
    }
  }

  await redis.set(redisKeyName, JSON.stringify(keyData), config.tokenTimeout)

  return keyData
}

module.exports.verifyClientApiToken = async (tokenString) => {
  try {
    let tokenPayload = jwt.decode(tokenString)

    if (!tokenPayload.iat) {
      return null
    }

    if (Math.abs((new Date().getTime()) - (tokenPayload.iat * 1000)) > config.tokenTimeout) {
      return null
    }

    let keyData = await getCachedKeyData(tokenPayload.keyId)
    if (!keyData) {
      return null
    }

    if (!hash.compareHash(keyData.key_secret, tokenPayload.keySecret)) {
      return null
    }

    jwt.verify(tokenString, keyData.key_shared)

    let merchantIds = []
    if (keyData.entities) {
      for (let entity of keyData.entities) {
        merchantIds.push(entity.merchantId)
      }
    }

    return {
      id: keyData.id,
      keyId: keyData.key_id,
      keyShared: keyData.key_shared,
      merchantIds: merchantIds,
      entities: keyData.entities
    }
  } catch (err) {
    return null
  }
}

module.exports.createApiKey = async (entities, name = config.defaultKeyName, email = config.defaultEmail) => {
  const keyId = crypto.randomBytes(config.keyIdLength).toString(config.keyIdEncoding)
  const keySecret = crypto.randomBytes(config.keySecretLength).toString(config.keySecretEncoding)
  const keySecretHashed = hash.hash(keySecret)
  const keyShared = crypto.randomBytes(config.keySharedLength).toString('base64')

  let keyChain = {
    keyId: keyId,
    keySecret: keySecret,
    keySecretHashed: keySecretHashed,
    keyShared: keyShared,
    entities
  }

  let apiKeyObject = {
    name: name,
    email: email,
    key_id: keyId,
    key_secret: keySecretHashed,
    key_shared: keyShared,
    active: true
  }

  let param = {}

  if (entities) {
    if (!Array.isArray(entities)) {
      entities = [entities]
    }
    apiKeyObject.entities = entities
    param = {
      include: [{ model: models.entity_api_key, as: 'entities' }]
    }
  }

  await models.api_key.create(apiKeyObject, param)

  return keyChain
}

module.exports.createServerApiToken = async (keyId, payload) => {
  let tokenString = null
  let tokenPayload = {
    keyId,
    payload_sha256: crypto.createHash('sha256').update(payload).digest('hex')
  }

  const keyData = await getCachedKeyData(keyId)

  if (keyData) {
    tokenString = jwt.sign(tokenPayload, keyData.key_shared)
  }

  return tokenString
}

module.exports.createClientApiToken = async (keyId, keySecret, keyShared) => {
  return jwt.sign({
    keyId,
    keySecret
  }, keyShared)
}
