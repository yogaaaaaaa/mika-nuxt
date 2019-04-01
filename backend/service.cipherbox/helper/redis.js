'use strict'

const Redis = require('ioredis')
Redis.Promise = require('bluebird')

const redisConfig = require('../config/redis')

const redis = new Redis(redisConfig.redisURL, {
  keyPrefix: redisConfig.redisPrefix
})

module.exports = redis
