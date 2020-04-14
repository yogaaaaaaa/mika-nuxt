'use strict'

/**
 * Provide ability to connect MQTT Broker that equipped with mosquitto_auth_plugin
 */

const _ = require('lodash')
const debug = require('debug')('mika:mqtt')
const mqtt = require('mqtt')
const crypto = require('crypto')
const micromatch = require('micromatch')

const Redis = require('ioredis')

const { delay } = require('./timer')
const ready = require('./ready')
ready.addModule('mqtt')
ready.addModule('mqtt-redis')

const config = require('../configs/mqttConfig')

const redis = new Redis(config.redisUrls)
redis.on('connect', () => ready.ready('mqtt-redis'))

const mqttClient = mqtt.connect(config.url, {
  username: config.superuserName,
  password: config.superuserPassword,
  clientId: config.clientId,
  keepalive: config.keepalive,
  clean: config.cleanSession
})
mqttClient.on('connect', () => ready.ready('mqtt'))

module.exports.client = mqttClient

module.exports.aclKeyTypes = {
  READ_ONLY: 1,
  READ_WRITE: 2
}

module.exports.pathDelays = []

module.exports.publish = async (topic, message, options = {}) => {
  options = Object.assign({
    qos: config.qosDefault,
    retain: false,
    dup: false
  }, options)

  if (exports.pathDelays.length) {
    for (const pathDelay of exports.pathDelays) {
      const duration = pathDelay.before || 0
      if (micromatch.isMatch(topic, pathDelay.path)) {
        if (_.isPlainObject(message) && _.isPlainObject(pathDelay.matches)) {
          for (const key of Object.keys(pathDelay.matches)) {
            const matchVal = _.get(message, key)
            if (matchVal) {
              if (pathDelay.matches[key] === matchVal) {
                debug('delay before with match', topic, key, duration, 'ms')
                if (duration < 0) return
                await delay(duration)
              }
            }
          }
        } else {
          debug('delay before', topic, duration, 'ms')
          if (duration < 0) return
          await delay(duration)
        }
      }
    }
  }

  return new Promise((resolve, reject) => {
    mqttClient.publish(
      topic,
      _.isPlainObject(message) ? JSON.stringify(message) : message,
      options,
      (err) => {
        if (err) {
          reject(err)
          return
        }
        if (debug.enabled) {
          debug('topic:', topic)
          if (_.isPlainObject(message)) {
            debug('message:', JSON.stringify(message, null, 2))
          }
        }
        resolve()
      })
  })
}

module.exports.hashPassword = (password, iter = config.passwordHashIter) => {
  const digest = 'sha256'
  const keyLength = 24
  const salt = crypto.randomBytes(18).toString('base64')

  if (iter === null) {
    iter = 100
  }

  const keyPromise = new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iter, keyLength, digest, (err, key) => {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        resolve('PBKDF2' + '$' + digest + '$' + iter + '$' + salt + '$' + key.toString('base64'))
      }
    })
  })

  return keyPromise
}

module.exports.getAuthKey = (username) => {
  return config.authPattern.replace(/%u/g, username)
}

module.exports.getAuthAclKey = (username, topic) => {
  return (config.authACLPattern.replace(/%u/g, username)).replace(/%t/g, topic)
}

module.exports.addAuthUser = async (username, password, expirySecond) => {
  return redis.setex(
    exports.getAuthKey(username),
    expirySecond,
    await exports.hashPassword(password))
}

module.exports.getAuthUser = async (username) => {
  return redis.get(
    exports.getAuthKey(username)
  )
}

module.exports.refreshAuthUser = async (username, expirySecond) => {
  return redis.expire(exports.getAuthKey(username), expirySecond)
}

module.exports.removeAuthUser = async (username) => {
  return redis.del(exports.getAuthKey(username))
}

module.exports.addAuthTopics = async (user, topicObjects, expirySecond) => {
  if (Array.isArray(topicObjects)) {
    const pipeline = redis.pipeline()
    for (const topic of topicObjects) {
      pipeline.setex(
        exports.getAuthAclKey(user, topic.topic),
        expirySecond,
        topic.rw
      )
    }
    return pipeline.exec()
  }
}

module.exports.refreshAuthTopics = async (user, topics, expirySecond) => {
  if (Array.isArray(topics)) {
    const pipeline = redis.pipeline()
    for (const topic of topics) {
      pipeline.expire(
        exports.getAuthAclKey(user, topic),
        expirySecond
      )
    }
    return pipeline.exec()
  }
}

module.exports.removeAuthTopics = async (user, topics) => {
  if (Array.isArray(topics)) {
    const pipeline = redis.pipeline()
    for (const topic of topics) {
      pipeline.del(
        exports.getAuthAclKey(user, topic)
      )
    }
    return pipeline.exec()
  }
}
