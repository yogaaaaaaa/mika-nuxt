'use strict'

/**
 * Internal API auth implementation
 */

const jwt = require('jsonwebtoken')

const redis = require('./redis')
const models = require('../models')
const notif = require('../libs/notif')

const commonConfig = require('../configs/commonConfig')
const types = require('./types/authTypes')

module.exports.types = types
module.exports.userTypes = types.userTypes
module.exports.userRoles = types.userRoles

function redisKey (...keys) {
  return `auth:${keys.reduce((acc, key) => `${acc}:${key}`)}`
}

module.exports.setSessionToken = async (userId, sessionToken, expirySecond) => {
  return redis.setex(
    redisKey(userId),
    expirySecond,
    sessionToken
  )
}

module.exports.refreshSessionToken = async (userId, expirySecond) => {
  return redis.expire(
    redisKey(userId),
    expirySecond)
}

module.exports.getSessionToken = async (userId) => {
  return redis.get(redisKey(userId))
}

module.exports.deleteSessionToken = async (userId) => {
  await redis.del(redisKey(userId))
}

module.exports.generateToken = (payload, secretKey = commonConfig.authSecretKey) => {
  return jwt.sign(payload, secretKey)
}

module.exports.verifyToken = (sessionToken, secretKey = commonConfig.authSecretKey) => {
  try {
    let payload = jwt.verify(sessionToken, secretKey)
    if (payload) {
      return payload
    }
  } catch (err) {}
}

/**
 * Do authentication
 */
module.exports.doAuth = async function (username, password, options = {}) {
  if (!username || !password) {
    return
  }

  let user = await models.user.findOne({
    where: { username: username }
  })

  if (!user) return

  if (!await user.checkPassword(password)) return

  if (Array.isArray(options.userTypes)) {
    if (!options.userTypes.includes(user.userType)) return
  }

  let authResult = {
    auth: {
      userId: user.id,
      username: user.username,
      userType: null,
      userRoles: user.userRoles
    },
    sessionToken: null,
    authExpirySecond: commonConfig.authExpirySecond
  }

  if (user.userType === exports.userTypes.AGENT) {
    let agent = await models.agent.findOne({
      where: {
        userId: user.id
      },
      include: [
        {
          model: models.outlet,
          attributes: [
            'id',
            'merchantId'
          ]
        }
      ],
      attributes: ['id', 'outletId']
    })
    if (agent) {
      authResult.auth.userType = exports.userTypes.AGENT
      authResult.auth.agentId = agent.id
      authResult.auth.outletId = agent.outletId
      authResult.auth.merchantId = agent.outlet.merchantId
      authResult.brokerDetail = await notif.addAgent(agent.id, commonConfig.authExpirySecond)
    }
  }

  if (user.userType === exports.userTypes.MERCHANT_STAFF) {
    let merchantStaff = await models.merchantStaff.findOne({
      where: {
        userId: user.id
      },
      attributes: ['id']
    })
    if (merchantStaff) {
      authResult.auth.userType = exports.userTypes.MERCHANT_STAFF
      authResult.auth.merchantId = merchantStaff.merchantId
      authResult.auth.merchantStaffId = merchantStaff.id
    }
  }

  if (user.userType === exports.userTypes.ADMIN) {
    let admin = await models.admin.findOne({
      where: {
        userId: user.id
      },
      attributes: ['id']
    })
    if (admin) {
      authResult.auth.userType = exports.userTypes.ADMIN
      authResult.auth.adminId = admin.id
    }
  }

  if ((user.secure || options.terminalId) && authResult.auth.merchantId && authResult.auth.userType) {
    if (!options.terminalId) return
    authResult.auth.terminalId = null
    let terminal = await models.terminal.scope('id').findOne({
      where: {
        id: options.terminalId,
        merchantId: authResult.auth.merchantId
      }
    })
    if (!terminal) return
    authResult.auth.terminalId = options.terminalId
  }

  if (authResult.auth.userType) {
    authResult.sessionToken = exports.generateToken(authResult.auth)
    await exports.setSessionToken(
      authResult.auth.userId,
      authResult.sessionToken,
      authResult.authExpirySecond
    )
    return authResult
  }
}

/**
 * Check auth session token
 */
module.exports.checkAuth = async (sessionToken) => {
  let auth = exports.verifyToken(sessionToken)

  if (auth) {
    if (await exports.getSessionToken(auth.userId) === sessionToken) {
      await exports.refreshSessionToken(auth.userId, commonConfig.authExpirySecond)
      if (auth.userType === exports.userTypes.AGENT) {
        await notif.refreshAgent(auth.agentId, commonConfig.authExpirySecond)
      }
      return auth
    }
  }
}

/**
 * Remove auth by token
 */
module.exports.removeAuth = async (sessionToken) => {
  let auth = exports.verifyToken(sessionToken)
  if (auth) {
    await exports.deleteSessionToken(auth.userId)
    if (auth.userType === exports.userTypes.AGENT) {
      await notif.removeAgent(auth.agentId)
    }
    return true
  }
}

/**
 * Remove auth by id
 */
module.exports.removeAuthByUserId = async (userId) => {
  exports.removeAuth(await exports.getSessionToken(userId))
}

/**
 * Change/reset current user password
 */
module.exports.changePassword = async (userId, password, oldPassword = null) => {
  let user = await models.user.findByPk(userId)

  if (user) {
    if (oldPassword) {
      if (!await user.checkPassword(oldPassword)) return
    }
    user.password = password
    await user.save()
    return user
  }
}
