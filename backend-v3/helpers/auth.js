'use strict'

/**
 * Internal API auth implementation
 */

const redis = require('./redis')
const hash = require('./hash')
const models = require('../models')
const jwt = require('jsonwebtoken')

const authConfig = require('../config/authConfig')

module.exports.config = authConfig

module.exports.userTypes = {
  ADMIN: 'admin',
  MERCHANT: 'merchant',
  AGENT: 'agent',
  MERCHANT_PIC: 'merchantPic'
}

module.exports.setSessionToken = async (userId, sessionKey) => {
  await redis.set(`${authConfig.redisPrefix}:${userId}`, sessionKey, authConfig.authExpiry * 1000)
}

module.exports.getSessionToken = async (userId) => {
  return redis.get(`${authConfig.redisPrefix}:${userId}`)
}

/**
 * Do authentication
 */
module.exports.doAuth = async function (username, password, options = {}) {
  if (!username || !password) {
    return null
  }

  let user = await models.user.findOne({
    where: {
      username: username
    }
  })

  let auth = null

  if (user) {
    if (Array.isArray(options.userTypes)) {
      if (!options.userTypes.includes(user.userType)) {
        return null
      }
    }

    if (await hash.compareBcryptHash(user.password, password)) {
      if (user.userType === exports.userTypes.ADMIN) {
        let admin = await models.admin.findOne({
          where: {
            userId: user.id
          },
          attributes: ['id', 'roles']
        })

        if (admin) {
          auth = {
            userId: user.id,
            username: user.username,
            userType: exports.userTypes.ADMIN,
            adminId: admin.id,
            roles: admin.roles
          }
        }
      }

      if (user.userType === exports.userTypes.MERCHANT) {
        let merchant = await models.merchant.findOne({
          where: {
            userId: user.id
          },
          attributes: ['id']
        })

        if (merchant) {
          auth = {
            userId: user.id,
            username: user.username,
            userType: exports.userTypes.MERCHANT,
            merchantId: merchant.toJSON()
          }
        }
      }

      if (user.userType === exports.userTypes.AGENT) {
        let agent = await models.agent.findOne({
          where: {
            userId: user.id
          },
          attributes: ['id', 'boundedToTerminal']
        })

        if (agent) {
          auth = {
            userId: user.id,
            username: user.username,
            userType: exports.userTypes.AGENT,
            agentId: agent.id,
            terminalId: null
          }

          if (agent.boundedToTerminal) {
            if (!options.terminalId) {
              return null
            }

            if (
              !await models.agentTerminal.findOne({
                where: {
                  terminalId: options.terminalId
                },
                attributes: ['id']
              })
            ) {
              return null
            }

            auth.terminalId = options.terminalId
          }
        }
      }

      if (user.userType === exports.userTypes.MERCHANT_PIC) {
        let agent = await models.merchantPic.findOne({
          where: {
            userId: user.id
          },
          attributes: ['id']
        })

        if (agent) {
          auth = {
            userId: user.id,
            username: user.username,
            userType: exports.userTypes.MERCHANT_PIC,
            merchantPic: agent.id
          }
        }
      }
    }

    if (auth) {
      let sessionToken = jwt.sign(auth, authConfig.secretKey)
      await exports.setSessionToken(auth.userId, sessionToken)
      return { sessionToken, auth }
    } else {
      return null
    }
  }
}

/**
 * Check auth session token
 */
module.exports.checkAuth = async (sessionToken) => {
  try {
    let auth = jwt.verify(sessionToken, authConfig.secretKey)

    if (auth) {
      if (await exports.getSessionToken(auth.userId) === sessionToken) {
        await exports.setSessionToken(auth.userId, sessionToken)
        return auth
      }
    }
  } catch (error) {
    console.log(error)
  }

  return null
}
