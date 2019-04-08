'use strict'

/**
 * This module wrap dTimer (https://www.npmjs.com/package/dtimer), a redis based
 * distributed timer. This module will use existing default redis (via /helpers/redis.js)
 */

const redis = require('redis') // NOTE: dtimer use node-redis library
require('bluebird').promisifyAll(redis)

const { DTimer } = require('dtimer')

const ready = require('./ready')
ready.addModule('dtimer')

const config = require('../configs/dTimerConfig')

const redisClientSub = redis.createClient(config.redisUrl)
const redisClientPub = redis.createClient(config.redisUrl)

const dtimer = new DTimer(
  config.nodeName,
  redisClientPub,
  redisClientSub,
  config
)

dtimer
  .join()
  .then(() => {
    ready.ready('dtimer')
  })
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
