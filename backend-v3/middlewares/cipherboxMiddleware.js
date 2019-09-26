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
  if (req.body.cbx && req.body.id) {
    const whereCipherbox = {
      id: req.body.id
    }
    if (req.auth) {
      if (req.auth.terminalId) {
        whereCipherbox.terminalId = req.auth.terminalId
      }
    }

    const cipherboxKey = await models.cipherboxKey.scope('active').findOne({
      where: whereCipherbox
    })

    if (cipherboxKey) {
      const keys = JSON.parse(cipherboxKey.keys)
      let unbox = null

      if (keys.cbx === cipherbox.cbType.cb0) {
        unbox = cipherbox.openCB0Box(req.body, Buffer.from(keys.key, 'base64'))
      } else if (keys.cbx === cipherbox.cbType.cb1) {
        unbox = cipherbox.openCB1Box(req.body, keys.key, keys.keyType)
      } else if (keys.cbx === cipherbox.cbType.cb3) {
        unbox = cipherbox.openCB3Box(req.body, Buffer.from(keys.key, 'base64'))
      }

      if (!unbox) {
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

      // We assume body is JSON, finger cross
      // if its not, just convert to string
      try {
        req.body = JSON.parse(unbox.data)
      } catch (error) {
        req.body = unbox.data.toString()
      }

      // Hijack send function
      const send = res.send
      res.send = (body) => {
        if (typeof body === 'object') {
          body = cipherbox.sealBoxWithCB0(JSON.stringify(body), unbox.key).box
        } else {
          body = cipherbox.sealBoxWithCB0(String(body), unbox.key).box
        }

        res.send = send
        return res.send(body)
      }
    }
    next()
    return
  }

  if (mandatory && req.auth) {
    if (req.auth.terminalId) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_AUTH_CIPHERBOX_MANDATORY
      )
      return
    }
  }

  next()
}
