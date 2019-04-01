'use strict'

/**
 * Simple wrapper for node-redis adding promise with bluebird
*/

const bluebird = require('bluebird')
const redis = require('redis')
bluebird.promisifyAll(redis)

let config = require('../config/redisConfig')

module.exports.redis = redis

module.exports.defaultCreateClient = () => {
  return redis.createClient(config)
}

const redisClient = exports.defaultCreateClient()
module.exports.client = redisClient

module.exports.get = async (key) => {
  return redisClient.getAsync(key)
}

module.exports.set = async (key, value = '', msExpiry = null) => {
  if (msExpiry) {
    return redisClient.setAsync(key, value, 'PX', msExpiry)
  } else {
    return redisClient.setAsync(key, value)
  }
}

module.exports.del = async (key) => {
  return redisClient.delAsync(key)
}
