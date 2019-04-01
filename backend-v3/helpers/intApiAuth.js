'use strict'

/**
 * Internal API auth implementation
 */

const redis = require('./redis')
const hash = require('./hash')
const models = require('../models')
const jwt = require('jsonwebtoken')

const intApiAuthConfig = require('../config/intApiAuthConfig')

module.exports.userType = {
  ADMIN: 'admin',
  MERCHANT: 'merchant',
  AGENT: 'agent',
  MERCHANT_PIC: 'merchantPic'
}

module.exports.setSessionToken = async (userId, sessionKey) => {
  await redis.set(`${intApiAuthConfig.redisPrefix}:${userId}`, sessionKey, intApiAuthConfig.authExpiry * 1000)
}

module.exports.getSessionToken = async (userId) => {
  return redis.get(`${intApiAuthConfig.redisPrefix}:${userId}`)
}

/**
 * Do authentication
 */
module.exports.doAuth = async function (username, password, options = {}) {
  if (!username || !password) {
    return null
  }

  let userData = await models.user.findOne({
    where: {
      username: username
    }
  })

  let auth = null

  if (userData) {
    if (options.expectedUserType) {
      if (userData.userType !== options.expectedUserType) {
        return null
      }
    }

    if (await hash.compareBcryptHash(userData.password, password)) {
      if (userData.userType === exports.userType.ADMIN) {
        let adminData = await models.admin.findOne({
          where: {
            userId: userData.id
          },
          attributes: ['id']
        })

        if (adminData) {
          auth = {
            userId: userData.id,
            username: userData.username,
            userType: exports.userType.ADMIN,
            adminId: adminData.id
          }
        }
      }

      if (userData.userType === exports.userType.MERCHANT) {
        let merchantData = await models.merchant.findOne({
          where: {
            userId: userData.id
          },
          attributes: ['id']
        })

        if (merchantData) {
          auth = {
            userId: userData.id,
            username: userData.username,
            userType: exports.userType.MERCHANT,
            merchantId: merchantData.toJSON()
          }
        }
      }

      if (userData.userType === exports.userType.AGENT) {
        let agentData = await models.agent.findOne({
          where: {
            userId: userData.id
          },
          attributes: ['id', 'boundedToTerminal']
        })

        if (agentData) {
          if (agentData.boundedToTerminal) {
            auth = {
              userId: userData.id,
              username: userData.username,
              userType: exports.userType.AGENT,
              agentId: agentData.id,
              terminalId: null
            }

            if (options.terminalId) {
              if (!await models.agentTerminal.findOne({
                where: {
                  terminalId: options.terminalId
                },
                attributes: ['id']
              })) {
                return null
              }
              auth.terminalId = options.terminalId
            }
          }
        }
      }

      if (userData.userType === exports.userType.MERCHANT_PIC) {
        let agentData = await models.merchantPic.findOne({
          where: {
            userId: userData.id
          },
          attributes: ['id']
        })

        if (agentData) {
          auth = {
            userId: userData.id,
            username: userData.username,
            userType: exports.userType.MERCHANT_PIC,
            merchantPic: agentData.id
          }
        }
      }
    }

    if (auth) {
      let sessionToken = jwt.sign(auth, intApiAuthConfig.secretKey)
      await exports.setSessionToken(auth.userId, sessionToken)
      return { sessionToken, auth }
    } else {
      return null
    }
  }
}

module.exports.checkAuth = async (sessionKey) => {
  try {
    let auth = jwt.verify(sessionKey, intApiAuthConfig.secretKey)

    if (auth) {
      if (await exports.getSessionToken(auth.userId) === sessionKey) {
        await exports.setSessionToken(auth.userId, sessionKey)
        return auth
      }
    }
  } catch (error) {
    console.log(error)
  }

  return null
}
