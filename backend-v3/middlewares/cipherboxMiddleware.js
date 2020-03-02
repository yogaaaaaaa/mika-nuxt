'use strict'

const msg = require('../libs/msg')
const cipherbox = require('../libs/cipherbox')
const models = require('../models')

/**
 * Middleware to transparently encrypt and decrypt any supported cipherbox.
 *
 * Warning: This middleware hijack `res.send` function
*/
module.exports.processCipherbox = (mandatory = false) => async function (req, res, next) {
  if (req.body && req.body.cb && req.body.id) {
    const whereCipherbox = {
      id: req.body.id
    }

    if (req.auth && req.auth.terminalId) {
      whereCipherbox.terminalId = req.auth.terminalId
    }

    const cipherboxKey = await models.cipherboxKey
      .scope('active')
      .findOne({ where: whereCipherbox })

    if (cipherboxKey) {
      const keyBox = JSON.parse(cipherboxKey.keys)
      const openResult = cipherbox.open(req.body, keyBox)
      if (!openResult.data) {
        msg.expressResponse(
          res,
          msg.msgTypes.MSG_ERROR_INVALID_CIPHERBOX
        )
        return
      }

      req.cipherbox = {
        cipherboxKeyId: cipherboxKey.id,
        terminalId: cipherboxKey.terminalId
      }

      // We assume body is JSON
      req.body = JSON.parse(openResult.data)

      // Hijack send function
      const resSend = res.send
      res.send = (body) => {
        res.send = resSend
        return res.send(cipherbox.createCb0({
          data: JSON.stringify(body),
          key: openResult.key
        }).box)
      }
    }

    return next()
  }

  if (mandatory && req.auth) {
    if (req.auth.terminalId) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_AUTH_CIPHERBOX_MANDATORY
      )
    }
  }

  next()
}
