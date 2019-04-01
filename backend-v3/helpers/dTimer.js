'use strict'

/**
 * This module wrap dTimer (https://www.npmjs.com/package/dtimer), a redis based
 * distributed timer. This module will use existing default redis (via /helpers/redis.js)
 */

const redis = require('./redis')

const config = require('../config/dTimerConfig')

const redisClientSub = redis.defaultCreateClient()
const redisClientPub = redis.defaultCreateClient()

const { DTimer } = require('dtimer')

const dtimer = new DTimer(config.nodeName, redisClientPub, redisClientSub, config)
dtimer.join()

module.exports.dtimer = dtimer

module.exports.handleEvent = async (callback) => {
  dtimer.on('event', async (ev) => {
    let cbReturnValue = await callback(ev)
    if (cbReturnValue) {
      await dtimer.confirm(ev.id)
    }
  })
}

module.exports.postEvent = async (eventObject = {}, delay = 0, maxRetries = 3) => {
  eventObject.maxRetries = maxRetries
  await dtimer.post(eventObject, delay)
}
