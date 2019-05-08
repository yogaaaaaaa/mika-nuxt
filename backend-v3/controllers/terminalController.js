'use strict'

const errorMiddleware = require('../middlewares/errorMiddleware')

const msgFactory = require('../helpers/msgFactory')
const cipherbox = require('../helpers/cipherbox')
const models = require('../models')

/**
 * Generate terminal key (cipherbox key) for certain terminal
 */
module.exports.generateTerminalCbKey = async (req, res, next) => {
  let cb3Key = await cipherbox.generateCb3Key()

  await models.sequelize.transaction(async t => {
    await models.cipherboxKey.destroy({
      where: {
        terminalId: req.params.terminalId
      }
    })
    await models.cipherboxKey.create({
      id: cb3Key.id,
      keys: JSON.stringify(cb3Key),
      status: cipherbox.keyStatus.ACTIVATED,
      terminalId: req.params.terminalId
    })
  })

  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_SUCCESS,
    cb3Key
  )
}

/**
 * All Middlewares for generateTerminalCbKey
 */
module.exports.generateTerminalCbKeyMiddlewares = [
  module.exports.generateTerminalCbKey,
  errorMiddleware.sequelizeErrorHandler
]
