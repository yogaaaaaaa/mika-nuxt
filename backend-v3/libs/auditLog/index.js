'use strict'

const micromatch = require('micromatch')
const jsonDiff = require('json-diff')
const debug = require('debug')('mika:auditLog')

const storage = require('./storage')

module.exports.storage = storage

const baseState = {
  timestamp: '',
  transport: {
    type: '',
    ipAddr: '',

    httpMethod: '',
    httpPath: '',
    httpHeader: '',
    httpBody: '',

    httpStatusCode: '',
    httpStatusMessage: '',
    httpHeaderRes: ''
  },
  event: {
    user: {},

    type: '',

    status: '',
    message: '',

    entityName: '',

    entityIds: [],
    entityDiff: ''
  }
}

function redactReplacer (key, val) {
  const normalizedKey = key.toLowerCase().trim()
  if (normalizedKey.includes('password')) return '*'
  if (normalizedKey.includes('usertoken')) {
    if (normalizedKey === 'usertokentype') return val
    return '*'
  }
  return val
}

function createState (state) {
  const newState = {
    ...JSON.parse(JSON.stringify(baseState)),
    timestamp: (new Date()).toISOString(),
    ...state
  }
  return newState
}

function redactBody (body) {
  if (!body) return

  body = JSON.parse(JSON.stringify(body))
  return JSON.stringify(body, redactReplacer)
}

function diffAndRedact (before, after) {
  return JSON.stringify(jsonDiff.diff(before, after), redactReplacer)
}

module.exports.expressAttach = ({
  paths = [],
  methods = [],
  exceptPaths = [],
  exceptMethods = []
}) => {
  debug('attached')

  return (req, res, next) => {
    req.audit = createState()

    if (methods.length && !methods.includes(req.method)) {
      next()
      return
    }

    if (exceptMethods.length && exceptMethods.includes(req.method)) {
      next()
      return
    }

    if (paths.length && !micromatch.isMatch(req.originalUrl, paths)) {
      next()
      return
    }

    if (exceptPaths.length && micromatch.isMatch(req.originalUrl, exceptPaths)) {
      next()
      return
    }

    debug('audit will be logged')

    const originalEnd = res.end
    res.end = function (...args) {
      const retVal = originalEnd.call(this, ...args)

      if (req.auth) {
        Object.keys(req.auth)
          .forEach(key => {
            req.audit.event.user[key] = String(req.auth[key] || '')
          })
      }

      req.audit.event.entityDiff = diffAndRedact(
        req.audit.event.entityBefore || {},
        req.audit.event.entityAfter || {}
      )
      req.audit.event.entityBefore = undefined
      req.audit.event.entityAfter = undefined

      if (req.audit.event.entityIds.length) {
        req.audit.event.entityIds =
          req.audit.event.entityIds.map(e => String(e))
        req.audit.event.entityIds =
          req.audit.event.entityIds.sort()
      }

      req.audit.transport.type = String(req.protocol || '')
      req.audit.transport.ipAddr = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip

      req.audit.transport.httpMethod = String(req.method || '')
      req.audit.transport.httpPath = String(req.originalUrl || '')
      req.audit.transport.httpHeader = JSON.stringify(req.headers) || ''

      req.audit.transport.httpBody = redactBody(req.body) || ''

      req.audit.transport.httpStatusCode = String(this.statusCode || '')
      req.audit.transport.httpStatusMessage = String(this.statusMessage)
      req.audit.transport.httpHeaderRes = JSON.stringify(this.getHeaders())

      if (this.msgType) {
        req.audit.event.status = this.msgType.status
        req.audit.event.message = this.msgType.message
      }

      // debug('audit', JSON.stringify(req.audit, null, 2))
      storage.create(req.audit)
        .catch((err) => console.error(err))

      return retVal
    }
    next()
  }
}
