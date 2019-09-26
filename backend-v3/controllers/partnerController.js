'use strict'

const errorMiddleware = require('../middlewares/errorMiddleware')

const msg = require('../libs/msg')
const extApiAuth = require('../libs/extApiAuth')
const models = require('../models')

module.exports.generatePartnerApiKey = async (req, res, next) => {
  const key = await extApiAuth.createKey(req.params.partnerId)

  await models.sequelize.transaction(async t => {
    await models.apiKey.destroy({
      where: {
        partnerId: req.params.partnerId
      },
      transaction: t
    })
    await models.apiKey.create({
      idKey: key.idKey,
      secretKey: key.secretKeyHashed,
      sharedKey: key.sharedKey,
      partnerId: req.params.partnerId
    }, { transaction: t })
  })

  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    key
  )
}

module.exports.generatePartnerApiKeyMiddlewares = [
  module.exports.generatePartnerApiKey,
  errorMiddleware.sequelizeErrorHandler
]
