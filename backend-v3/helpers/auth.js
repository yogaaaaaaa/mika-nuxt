'use strict'

/**
 * Internal API auth implementation
 */

const redis = require('./redis')
const models = require('../models')
const jwt = require('jsonwebtoken')

const notif = require('../helpers/notif')

const appConfig = require('../configs/appConfig')

module.exports.userTypes = {
  ADMIN: 'admin',
  AGENT: 'agent',
  MERCHANT_STAFF: 'merchantStaff',
  PARTNER_STAFF: 'partnerStaff',
  ACQUIRER_STAFF: 'acquirerStaff'
}

module.exports.userRoles = {
  ADMIN_FINANCE: 'adminFinance',
  ADMIN_HR: 'adminHr',
  ADMIN_MARKETING: 'adminMarketing',
  ADMIN_SUPPORT: 'adminSupport',
  ADMIN_LOGISTIC: 'adminLogistic'
}

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

module.exports.generateToken = (payload, secretKey = appConfig.authSecretKey) => {
  return jwt.sign(payload, secretKey)
}

module.exports.verifyToken = (sessionToken, secretKey = appConfig.authSecretKey) => {
  try {
    let payload = jwt.verify(sessionToken, secretKey)
    if (payload) {
      return payload
    }
  } catch (err) {
    console.error(err)
  }
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
    authExpirySecond: appConfig.authExpirySecond
  }

  if (user.userType === exports.userTypes.AGENT) {
    let agent = await models.agent.findOne({
      where: {
        userId: user.id
      },
      attributes: ['id', 'merchantId']
    })
    if (agent) {
      authResult.auth.userType = exports.userTypes.AGENT
      authResult.auth.agentId = agent.id
      authResult.auth.merchantId = agent.merchantId
      authResult.brokerDetail = await notif.addAgent(agent.id, appConfig.authExpirySecond)
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
      await exports.refreshSessionToken(auth.userId, appConfig.authExpirySecond)
      if (auth.userType === exports.userTypes.AGENT) {
        await notif.refreshAgent(auth.agentId, appConfig.authExpirySecond)
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
