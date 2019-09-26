'use strict'

const auth = require('../../libs/auth')
const models = require('../../models')
const msg = require('../../libs/msg')

const err = require('../../libs/err')

/**
 * Generate resetUser handler for specified user type (e.g 'admin', 'agent')
 */
module.exports.createResetUserPasswordHandler = (userType) =>
  async (req, res, next) => {
    const userTypeModel = models[userType]
    const userTypeInstance = await userTypeModel.findOne(
      {
        where: {
          id: req.params[`${userType}Id`]
        },
        include: [
          models.user
        ]
      }
    )
    if (!userTypeInstance) throw err.createError(err.genericErrorTypes.ENTITY_NOT_FOUND)
    const generatedPassword = await auth.resetPassword(
      userTypeInstance.user,
      req.query.humane_password
    )
    await userTypeInstance.user.save()
    msg.expressResponse(res,
      msg.msgTypes.MSG_SUCCESS_AUTH_PASSWORD_RESET,
      {
        userId: userTypeInstance.user.id,
        username: userTypeInstance.user.username,
        password: generatedPassword
      }
    )
  }
