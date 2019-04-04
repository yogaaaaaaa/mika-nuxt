'use strict'

/**
 * Provide ability to connect MQTT Broker that equipped with mosquitto_auth_plugin
 */

const mqtt = require('mqtt')
const redis = require('./redis')
const crypto = require('crypto')

const ready = require('./ready')
ready.addComponent('mqtt')

module.exports.mqtt = mqtt

const config = require('../config/mqttConfig')
module.exports.config = config

const mqttClient = mqtt.connect(config.url, {
  username: config.superuserName,
  password: config.superuserPassword,
  clientId: config.clientId,
  keepalive: config.keepAlive,
  clean: config.cleanSession
})
module.exports.client = mqttClient
mqttClient.on('connect', () => {
  ready.ready('mqtt')
})

module.exports.aclKey = {
  READ_ONLY: 1,
  READ_WRITE: 2
}

module.exports.waitUntilMqttClientConnected = (client = mqttClient) => {
  return new Promise((resolve, reject) => {
    let timeoutHandler = 0

    const _resolve = () => {
      clearTimeout(timeoutHandler)
      resolve(true)
    }

    if (!client.connected) {
      timeoutHandler = setTimeout(() => {
        client.off('connect', _resolve)
        reject(new Error('Timeout waiting MQTT to be connected'))
      }, config.waitConnectTimeout * 1000)

      client.once('connect', _resolve)
    } else {
      resolve(true)
    }
  })
}

module.exports.hashPassword = (password, iter = config.passwordHashIter) => {
  let digest = 'sha256'
  let keyLength = 24
  let saltLength = 16

  if (iter === null) {
    iter = 100
  }

  /**
   * The salt is randomly generated 16 character, charset based
   * WARNING : this random generator is not secure, but (maybe) good enough for use in salting
   */
  let salt = ''
  const charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-=' // DO NOT INCLUDE RESERVED Character like $

  for (let i = 0; i < saltLength; i++) {
    salt += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  let keyPromise = new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iter, keyLength, digest, (err, key) => {
      if (err) {
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

module.exports.addAuthUser = async (username, password = null, expiry = null) => {
  if (!password) {
    password = crypto.randomBytes(18).toString('base64')
  }

  await redis.set(exports.getAuthKey(username), await exports.hashPassword(password), expiry)

  return password
}

module.exports.addAuthTopic = async (username, topic, rw = exports.aclKey.READ_ONLY, expiry = null) => {
  await redis.set(exports.getAuthAclKey(username, topic), rw, expiry)
}

module.exports.publish = async (topic, message, options = {}) => {
  await exports.waitUntilMqttClientConnected()

  options = Object.assign({
    qos: config.qosDefault,
    retain: false,
    dup: false
  }, options)

  return new Promise(async (resolve, reject) => {
    mqttClient.publish(topic, message, options, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
