'use strict'

const mosqAuthHash = require('./mosqAuthHash')
const config = require('config')
const redis = require('./redis')

const aclKeyTypes = {
  READ_ONLY: '1',
  READ_WRITE: '2'
}

function getAuthKey (username) {
  return config.authPattern.replace(/%u/g, username)
}

function getAuthAclKey (username, topic) {
  return (config.authAclPattern.replace(/%u/g, username)).replace(/%t/g, topic)
}

module.exports.authenticate = async function (client, username, password, callback) {
  const passwordHash = await redis.get(getAuthKey(username))
  if (passwordHash) {
    if (await mosqAuthHash.checkPassword(password, passwordHash)) {
      client.username = username
      console.log(`auth '${username}' '${client.id}'`)
      return callback(null, true)
    }
  }
  console.log(`auth failed '${username}' '${client.id}'`)
  callback(null, false)
}

module.exports.authorizePublish = async function (client, packet, callback) {
  const username = client.username

  if (username === config.authRootUser) return callback()

  const aclTypes = await redis.get(getAuthAclKey(username, packet.topic))
  if (aclTypes === aclKeyTypes.READ_WRITE) return callback()

  callback(Error('Not authorized to Publish'))
}

module.exports.authorizeSubscribe = async function (client, subscription, callback) {
  const username = client.username

  if (username === config.authRootUser) return callback(null, subscription)

  const aclTypes = await redis.get(getAuthAclKey(username, subscription.topic))
  if ([aclKeyTypes.READ_WRITE, aclKeyTypes.READ_ONLY].includes(aclTypes)) return callback(null, subscription)

  callback(Error('Not authorized to Subscribe'))
}
