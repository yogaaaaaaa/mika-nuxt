'use strict'

const msg = require('../libs/msg')
const models = require('../models')
const err = require('../libs/err')

const errorMiddleware = require('../middlewares/errorMiddleware')
const userValidator = require('../validators/userValidator')

const validatorHelper = require('../validators/helper')

module.exports.checkUserPassword = async (req, res, next) => {
  const user = await models.user.findByPk(req.params.userId)
  if (!user) {
    throw err.createError(err.genericErrorTypes.ENTITY_NOT_FOUND)
  }

  if (!validatorHelper.isStandardPassword(req.body.password)) {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_ERROR_AUTH_PASSWORD_CHECK_FAILED_BAD_FORMAT
    )
    return
  }

  if (await user.isIncludedInLastPasswords(req.body.password)) {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_ERROR_AUTH_PASSWORD_CHECK_FAILED_ALREADY_USED
    )
  }
}

module.exports.checkUserPasswordMiddlewares = [
  userValidator.checkPassword,
  errorMiddleware.validatorErrorHandler,
  exports.checkUserPassword
]
