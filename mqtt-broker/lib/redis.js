'use strict'

const config = require('config')
const Redis = require('ioredis')

const redis = new Redis(config.redisUri)

module.exports = redis
