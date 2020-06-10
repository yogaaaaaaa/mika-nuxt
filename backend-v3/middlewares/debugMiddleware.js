'use strict'

const tamper = require('tamper')
const { delay } = require('libs/timer')
const micromatch = require('micromatch')

module.exports.clientDelay = () => {
  const debug = require('debug')('mika:debugMiddleware:delay')
  return [
    async (req, res, next) => {
      // Artificial delay in development environment only
      if (req.body && req.body._debug) {
        if (req.body._debug.delay) {
          debug('delay:', req.body._debug.delay)
          await delay(req.body._debug.delay)
        }
      }
      next()
    }
  ]
}

module.exports.log = () => {
  let requestCounter = 0
  return [
    (req, res, next) => {
      const debug = require('debug')('mika:debugMiddleware:log:req')

      requestCounter++
      debug(`[${requestCounter}] ${req.method} ${req.originalUrl}`)
      debug(`[${requestCounter}] Request Headers:`, JSON.stringify(req.headers, null, 2))
      debug(`[${requestCounter}] Request Body:`, JSON.stringify(req.body, null, 2))
      next()
    },
    tamper(function (req, res) {
      const debug = require('debug')('mika:debugMiddleware:log:res')
      if (!debug.enabled) return

      const logFooter = () => debug(`[${requestCounter}] End ${req.method} ${req.originalUrl}`)

      debug(`[${requestCounter}] Response Headers:`, JSON.stringify(req.headers, null, 2))

      const contentType = (res.getHeader('content-type') || '').toLowerCase()
      if (contentType.includes('application/json')) {
        return (body) => {
          debug(`[${requestCounter}] Response Body:`, JSON.stringify(JSON.parse(body), null, 2))
          logFooter()
          return body
        }
      } else {
        logFooter()
      }
    })
  ]
}

module.exports.pathDelays = []

module.exports.pathDelay = () => {
  const debug = require('debug')('mika:debugMiddleware:pathDelay')
  const makeDelay = async (req, isAfter) => {
    for (const pathDelay of exports.pathDelays) {
      const duration = (isAfter ? pathDelay.after : pathDelay.before) || 0
      if (pathDelay.method && req.method !== pathDelay.method) break
      if (micromatch.isMatch(req.path, pathDelay.path)) {
        if (isAfter) {
          debug('after', req.path, duration, 'ms')
        } else {
          debug('before', req.path, duration, 'ms')
        }
        await delay(duration)
      } else {
        if (!isAfter) {
          debug('path', req.path, 'not match', pathDelay.path)
        }
      }
    }
  }
  return async (req, res, next) => { // request delay
    await makeDelay(req)

    const originalEnd = res.end
    res.end = function (...args) {
      makeDelay(req, true).then(() => originalEnd.call(this, ...args))
      return this
    }
    next()
  }
}
