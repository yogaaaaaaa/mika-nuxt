'use strict'

const errorMiddleware = require('../middlewares/errorMiddleware')

const msgFactory = require('../helpers/msgFactory')
const extApiAuth = require('../helpers/extApiAuth')
const models = require('../models')

module.exports.generatePartnerApiKey = async (req, res, next) => {
  let key = await extApiAuth.createKey(req.params.partnerId)

  await models.sequelize.transaction(async t => {
    await models.apiKey.destroy({
      where: {
        partnerId: req.params.partnerId
      }
    }, { transaction: t })
    await models.apiKey.create({
      idKey: key.idKey,
      secretKey: key.secretKeyHashed,
      sharedKey: key.sharedKey,
      partnerId: req.params.partnerId
    }, { transaction: t })
  })

  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_SUCCESS,
    key
  )
}

module.exports.generatePartnerApiKeyMiddlewares = [
  module.exports.generatePartnerApiKey,
  errorMiddleware.sequelizeErrorHandler
]