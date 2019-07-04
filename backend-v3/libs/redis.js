'use strict'

/**
 * Wrapper for ioredis
 */

const Redis = require('ioredis')
const redisConfig = require('../configs/redisConfig')

const ready = require('./ready')
ready.addModule('redis')

const redis = new Redis(redisConfig.urls, {
  keyPrefix: redisConfig.prefix
})
redis.on('connect', () => {
  ready.ready('redis')
})

module.exports = redis
