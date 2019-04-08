'use strict'

/**
 * Wrapper for ioredis
 */

const Redis = require('ioredis')
const appConfig = require('../configs/appConfig')

const ready = require('./ready')
ready.addModule('redis')

const redis = new Redis(appConfig.redisUrls, {
  keyPrefix: appConfig.redisPrefix
})
redis.on('connect', () => {
  ready.ready('redis')
})

module.exports = redis
