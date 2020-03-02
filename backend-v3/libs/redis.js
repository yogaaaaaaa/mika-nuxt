'use strict'

/**
 * Wrapper for ioredis
 */

const Redis = require('ioredis')
const redisConfig = require('configs/redisConfig')

const ready = require('./ready')
ready.addModule('redis')

class CustomRedis extends Redis {
  constructor (urls, options) {
    super(urls, options)
    this._keyPrefix = options.keyPrefix
  }

  deletePattern (pattern) {
    const keyPrefix = this._keyPrefix ? this._keyPrefix : ''
    const delKeySize = 1000
    let delKeys = []

    return new Promise((resolve, reject) => {
      const stream = redis.scanStream({ match: `${keyPrefix}${pattern}`, count: delKeySize })
      stream.on('data', async (keys) => {
        for (const key of keys) {
          const delKey = keyPrefix.length
            ? key.slice(keyPrefix.length)
            : key
          delKeys.push(delKey)
        }

        if (delKeys.length >= delKeySize) {
          await this.del(delKeys)
          delKeys = []
        }
      })
      stream.on('end', async () => {
        if (delKeys.length) await this.del(delKeys)
        resolve()
      })
    })
  }
}

const redis = new CustomRedis(redisConfig.urls, {
  keyPrefix: redisConfig.prefix
})
redis.on('connect', () => {
  ready.ready('redis')
})

module.exports = redis
