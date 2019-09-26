'use strict'

/**
 * Internal API authentication helper
 * For password and user implementation, see user model
 */

const jwt = require('jsonwebtoken')
const moment = require('moment')

const passwd = require('./passwd')
const err = require('./err')
const redis = require('./redis')
const notif = require('./notif')
const models = require('../models')

const commonConfig = require('../configs/commonConfig')
const constants = require('./constants/auth')

module.exports.errorTypes = constants.errorTypes
module.exports.userTypes = constants.userTypes
module.exports.userRoles = constants.userRoles

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
    const payload = jwt.verify(sessionToken, secretKey)
    if (payload) {
      return payload
    }
  } catch (err) {}
}

/**
 * Do authentication
 */
module.exports.doAuth = async function (username, password, options = {}) {
  if (!username || !password) return

  const user = await models.user.findOne({
    where: { username }
  })
  if (!user) return

  if (user.checkFailedLoginAttempt()) {
    await user.saveFailedLogin()
    throw err.createError(exports.errorTypes.FAILED_LOGIN_ATTEMPT_EXCEEDED)
  }

  if (user.isPasswordExpired()) {
    await user.saveFailedLogin()
    throw err.createError(exports.errorTypes.PASSWORD_EXPIRED)
  }

  if (!await user.checkPassword(password)) {
    await user.saveFailedLogin()
    return
  }

  if (Array.isArray(options.userTypes)) {
    if (!options.userTypes.includes(user.userType)) {
      user.saveFailedLogin()
      return
    }
  }

  const userExpiry = user.getPasswordExpiryMoment() || null

  const authResult = {
    auth: {
      userId: user.id,
      username: user.username,
      userType: null,
      userRoles: user.userRoles,
      userExpiry: user.followPasswordExpiry ? userExpiry : null
    },
    sessionToken: null,
    authExpirySecond: commonConfig.authExpirySecond
  }

  if (user.userType === exports.userTypes.AGENT) {
    const agent = await models.agent.findOne({
      where: {
        userId: user.id
      },
      attributes: ['id', 'outletId'],
      include: [
        {
          model: models.outlet,
          attributes: ['id', 'merchantId'],
          required: true,
          include: [
            { model: models.merchant.scope('id'), required: true }
          ]
        }
      ]
    })
    if (agent) {
      authResult.auth.userType = exports.userTypes.AGENT
      authResult.auth.agentId = agent.id
      authResult.auth.outletId = agent.outletId
      authResult.auth.merchantId = agent.outlet.merchantId
      authResult.brokerDetail = await notif.addAgent(agent.id, commonConfig.authExpirySecond)
    }
  } else if (user.userType === exports.userTypes.MERCHANT_STAFF) {
    const merchantStaff = await models.merchantStaff.findOne({
      where: {
        userId: user.id
      },
      attributes: ['id', 'merchantId'],
      include: [
        { model: models.merchant.scope('id'), required: true }
      ]
    })
    if (merchantStaff) {
      authResult.auth.userType = exports.userTypes.MERCHANT_STAFF
      authResult.auth.merchantStaffId = merchantStaff.id
      authResult.auth.merchantId = merchantStaff.merchantId
    }
  } else if (user.userType === exports.userTypes.ACQUIRER_STAFF) {
    const acquirerStaff = await models.acquirerStaff.findOne({
      where: { userId: user.id },
      attributes: ['id', 'acquirerCompanyId'],
      include: [
        { model: models.acquirerCompany.scope('id'), required: true }
      ]
    })
    if (acquirerStaff) {
      authResult.auth.userType = exports.userTypes.ACQUIRER_STAFF
      authResult.auth.acquirerCompanyId = acquirerStaff.acquirerCompanyId
      authResult.auth.acquirerStaffId = acquirerStaff.id
    }
  } else if (user.userType === exports.userTypes.ADMIN) {
    const admin = await models.admin.findOne({
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

  // Secure agent-terminal check
  if ((user.secure || options.terminalId) && authResult.auth.merchantId && authResult.auth.userType) {
    if (!options.terminalId) return
    authResult.auth.terminalId = null
    const terminal = await models.terminal.scope('id').findOne({
      where: {
        id: options.terminalId,
        merchantId: authResult.auth.merchantId
      }
    })
    if (!terminal) {
      await user.saveFailedLogin()
      return
    } else {
      authResult.auth.terminalId = options.terminalId
    }
  }

  if (authResult.auth.userType) {
    authResult.sessionToken = exports.generateToken(authResult.auth)
    await exports.setSessionToken(
      authResult.auth.userId,
      authResult.sessionToken,
      authResult.authExpirySecond
    )
    await user.saveSuccessLogin()
    return authResult
  } else {
    await user.saveFailedLogin()
  }
}

/**
 * Check auth session token
 */
module.exports.checkAuth = async (sessionToken) => {
  const auth = exports.verifyToken(sessionToken)

  if (auth) {
    if (auth.userExpiry && moment().isAfter(moment.unix(auth.userExpiry))) {
      await exports.removeAuth(sessionToken)
      return
    }

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
 * Remove auth by session token
 */
module.exports.removeAuth = async (sessionToken) => {
  const auth = exports.verifyToken(sessionToken)
  if (auth) {
    await exports.deleteSessionToken(auth.userId)
    if (auth.userType === exports.userTypes.AGENT) {
      await notif.removeAgent(auth.agentId)
    }
    return true
  }
}

/**
 * Remove auth by user id
 */
module.exports.removeAuthByUserId = async (userId) => {
  exports.removeAuth(await exports.getSessionToken(userId))
}

/**
 * Change user password by session token
 */
module.exports.changePassword = async (userId, password, oldPassword) => {
  const user = await models.user.findByPk(userId)
  if (!user) {
    throw err.createError(exports.errorTypes.INVALID_USER)
  }
  if (!await user.checkPassword(oldPassword)) {
    throw err.createError(exports.errorTypes.INVALID_OLD_PASSWORD)
  }
  if (await user.isIncludedInLastPasswords(password)) {
    throw err.createError(exports.errorTypes.CANNOT_CHANGE_TO_USED_PASSWORD)
  }
  user.setLastPasswordChangeAt()
  user.password = password
  await user.save()
  await exports.removeAuthByUserId(userId)

  return user
}

/**
 * Change expired user password, with strict check of expiry
 */
module.exports.changeExpiredPassword = async (username, password, oldPassword) => {
  const user = await models.user.findOne({
    where: { username }
  })
  if (!user) return
  if (!user.isPasswordExpired()) return
  if (!await user.checkPassword(oldPassword)) return
  if (await user.isIncludedInLastPasswords(password)) return

  user.setLastPasswordChangeAt()
  user.password = password
  await user.save()

  return user
}

/**
 * Reset password by user model
 */
module.exports.resetPassword = async (user, humanePassword) => {
  const password = passwd.standardPasswordGenerator.generate(humanePassword)
  if (await user.isIncludedInLastPasswords(password)) {
    throw err.createError(exports.errorTypes.PASSWORD_GENERATION_FAILED)
  }
  user.password = password
  user.lastPasswordChangeAt = null

  return password
}

/**
 * Check update password if do not included in old password
 */
module.exports.checkPasswordUpdate = async (user) => {
  if (user.changed('password')) {
    if (await user.isIncludedInLastPasswords(user.password)) {
      throw err.createError(exports.errorTypes.CANNOT_CHANGE_TO_USED_PASSWORD)
    }
    user.setLastPasswordChangeAt()
  }
}
