'use strict'

const redis = require('libs/redis')
const commonConfig = require('configs/commonConfig')

const authExpirySecond = commonConfig.authExpirySecond

function redisKey (...keys) {
  return `session:${keys.reduce((acc, key) => `${acc}:${key}`)}`
}

module.exports.set = async (userId, data) => {
  const key = redisKey(userId)
  const redisPipeline = redis.pipeline()
  redisPipeline.hmset(key, data)
  redisPipeline.expire(authExpirySecond)
  return redisPipeline.exec()
}

module.exports.get = async (userId, field) => {
  const key = redisKey(userId)
  if (field) {
    return redis.hget(key, field)
  } else {
    const result = await redis.hgetall(key)
    if (Object.entries(result).length) {
      return result
    }
  }
}

module.exports.refresh = async (userId) => {
  return redis.expire(redisKey(userId), authExpirySecond)
}

module.exports.delete = async (userId) => {
  return redis.del(redisKey(userId))
}
