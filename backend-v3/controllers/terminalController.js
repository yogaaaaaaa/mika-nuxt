'use strict'

const { param } = require('express-validator/check')

const msgFactory = require('../helpers/msgFactory')
const cipherbox = require('../helpers/cipherbox')
const models = require('../models')

module.exports.generateTerminalCbKey = async (req, res, next) => {
  let cb3Key = await cipherbox.generateCb3Key()
  await models.cipherboxKey.destroy({
    where: {
      terminalId: req.params.terminalId
    }
  })
  await models.cipherboxKey.create({
    terminalId: req.params.terminalId,
    idKey: cb3Key.id,
    keys: JSON.stringify(cb3Key)
  })

  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_SUCCESS,
    cb3Key
  )
}

module.exports.generateTerminalCbKeyValidator = [
  param('terminalId').custom(async (terminalId) => {
    if (!await models.terminal.scope('idOnly').findByPk(terminalId)) return false
  })
]
