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

if (config.disabled) console.log('dtimer : is disabled')

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
  if (config.disabled) return
  dtimer.on('event', async (event) => {
    if (await callback(event)) await dtimer.confirm(event.id)
  })
}

module.exports.postEvent = async (eventObject, delay = 0) => {
  if (config.disabled) return
  eventObject = Object.assign(
    {
      maxRetries: 3
    },
    eventObject)
  await dtimer.post(eventObject, delay)
}

module.exports.cancelEvent = async (eventId) => {
  if (config.disabled) return
  await dtimer.cancel(eventId)
}
