'use strict'

/**
 * Internal API authentication helper
 * For password and user implementation, see user model
 */

const moment = require('moment')

const uid = require('libs/uid')
const crypto = require('crypto')
const hash = require('libs/hash')
const sessionStore = require('libs/sessionStore')
const passwd = require('libs/passwd')
const error = require('libs/error')
const notif = require('libs/notif')
const models = require('models')

const { EventEmitter2 } = require('eventemitter2')

const commonConfig = require('configs/commonConfig')
const constants = require('./constants')

const authExpirySecond = commonConfig.authExpirySecond

module.exports.constants = constants
module.exports.eventTypes = constants.eventTypes
module.exports.errorTypes = constants.errorTypes
module.exports.userTypes = constants.userTypes
module.exports.userRoles = constants.userRoles

module.exports.authExpirySecond = authExpirySecond

module.exports.sessionStore = sessionStore

function createSessionTokenHmac (secretKey, userId, id) {
  return crypto.createHmac('sha256', secretKey)
    .update(Buffer.from(`${userId}.${id}`))
    .digest()
}

async function createSessionToken (userId) {
  const secretKey = commonConfig.authSecretKey
  const id = (await uid.ksuid.random()).string
  const hmac = createSessionTokenHmac(secretKey, userId, id)
  return `${userId}.${id}.${hmac.toString('base64')}`
}

function verifySessionToken (sessionToken) {
  try {
    const secretKey = commonConfig.authSecretKey
    const [userId, id, hmacHex] = sessionToken.split('.')
    const hmac = Buffer.from(hmacHex, 'base64')
    const calcHmac = createSessionTokenHmac(secretKey, userId, id)
    if (crypto.timingSafeEqual(calcHmac, hmac)) return userId
  } catch (err) {}
}

/**
 * Event emitter for auth
 */
module.exports.event = new EventEmitter2()

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
    throw error.createError({ name: exports.errorTypes.FAILED_LOGIN_ATTEMPT_EXCEEDED })
  }

  if (user.isPasswordExpired()) {
    await user.saveFailedLogin()
    throw error.createError({ name: exports.errorTypes.PASSWORD_EXPIRED })
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
    authExpirySecond: authExpirySecond,
    userDek: undefined,
    sessionUserDek: undefined
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
      authResult.brokerDetail = await notif.addAgent(agent.id, authExpirySecond)
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

  // Secure user-terminal check
  if (
    (user.secure || options.terminalId) &&
    authResult.auth.merchantId &&
    authResult.auth.userType
  ) {
    if (!options.terminalId) return
    authResult.auth.terminalId = null
    const terminal = await models.terminal.scope('id').findOne({
      attributes: ['id'],
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
    const sessionData = {
      sessionToken: await createSessionToken(authResult.auth.userId),
      auth: JSON.stringify(authResult.auth),
      userDek: await hash.createDek(commonConfig.authSecretKey, username, password),
      sessionUserDek: crypto.randomBytes(32).toString('base64'),
      brokerDetail: JSON.stringify(authResult.brokerDetail || {})
    }
    await sessionStore.set(
      authResult.auth.userId,
      sessionData
    )

    authResult.userDek = sessionData.userDek
    authResult.sessionToken = sessionData.sessionToken
    authResult.sessionUserDek = sessionData.sessionUserDek

    await user.saveSuccessLogin()
    await exports.event.emitAsync(constants.eventTypes.AUTH_SUCCESS, authResult.auth)

    return authResult
  } else {
    await user.saveFailedLogin()
  }
}

/**
 * Check session token and return session data
 */
module.exports.checkAuth = async (sessionToken) => {
  const userId = verifySessionToken(sessionToken)
  if (userId) {
    const sessionData = await sessionStore.get(userId)
    if (sessionData) {
      sessionData.auth = JSON.parse(sessionData.auth)
      sessionData.brokerDetail = JSON.parse(sessionData.brokerDetail)
      const auth = sessionData.auth
      // Check password expiry
      if (auth.userExpiry && moment().isAfter(moment.unix(auth.userExpiry))) {
        await exports.removeAuth(sessionToken)
        return
      }
      if (sessionData.sessionToken === sessionToken) {
        await sessionStore.refresh(auth.userId)
        if (auth.userType === exports.userTypes.AGENT) {
          await notif.refreshAgent(auth.agentId)
        }
        return sessionData
      }
    }
  }
}

/**
 * Remove auth by session token
 */
module.exports.removeAuth = async (sessionToken) => {
  const userId = verifySessionToken(sessionToken)
  if (userId) {
    const sessionData = await sessionStore.get(userId)
    if (sessionData) {
      const auth = JSON.parse(sessionData.auth)
      await sessionStore.delete(userId)
      if (auth.userType === exports.userTypes.AGENT) {
        await notif.removeAgent(auth.agentId)
      }
      return auth
    }
  }
}

/**
 * Remove auth by user id
 */
module.exports.removeAuthByUserId = async (userId) => {
  await sessionStore.delete(userId)
}

/**
 * Change user password by userId
 */
module.exports.changePassword = async (userId, password, oldPassword) => {
  const user = await models.user.findByPk(userId)
  if (!user) {
    throw error.createError({ name: exports.errorTypes.INVALID_USER })
  }
  if (!await user.checkPassword(oldPassword)) {
    throw error.createError({ name: exports.errorTypes.INVALID_OLD_PASSWORD })
  }
  if (await user.isIncludedInLastPasswords(password)) {
    throw error.createError({ name: exports.errorTypes.CANNOT_CHANGE_TO_USED_PASSWORD })
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
module.exports.resetPassword = async (user, isHumane) => {
  const password = passwd.standardPasswordGenerator.generate(isHumane)
  if (await user.isIncludedInLastPasswords(password)) {
    throw error.createError({ name: exports.errorTypes.PASSWORD_GENERATION_FAILED })
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
      throw error.createError({ name: exports.errorTypes.CANNOT_CHANGE_TO_USED_PASSWORD })
    }
    user.setLastPasswordChangeAt()
  }
}

/**
 * Check password by user id
 */
module.exports.checkPassword = async (userId, password) => {
  const user = await models.user.findByPk(userId)
  if (user) {
    if (await user.checkPassword(password)) return true
  }
}
