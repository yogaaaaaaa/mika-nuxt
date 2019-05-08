'use strict'

const msgFactory = require('../helpers/msgFactory')
const cipherbox = require('../helpers/cipherbox')
const models = require('../models')

const debug = {
  processCipherbox: require('debug')('cipherboxMiddleware:processCipherbox')
}

/**
 * Middleware to transparently encrypt and decrypt any supported cipherbox.
 *
 * Warning: This middleware hijack `res.send` function
*/
module.exports.processCipherbox = (mandatory = false) => async function (req, res, next) {
  if (req.body.cbx && req.body.id) {
    debug.processCipherbox('detected')

    let whereCipherbox = {
      id: req.body.id
    }
    if (req.auth) {
      if (req.auth.terminalId) {
        whereCipherbox.terminalId = req.auth.terminalId
      }
    }

    let cipherboxKey = await models.cipherboxKey.scope('active').findOne({
      where: whereCipherbox
    })

    if (cipherboxKey) {
      debug.processCipherbox(`key id ${cipherboxKey.id}, unboxing`)
      let keys = JSON.parse(cipherboxKey.keys)
      let unbox = null

      if (keys.cbx === cipherbox.cbType.cb0) {
        debug.processCipherbox('type cb0')
        unbox = cipherbox.openCB0Box(req.body, Buffer.from(keys.key, 'base64'))
      } else if (keys.cbx === cipherbox.cbType.cb1) {
        debug.processCipherbox('type cb1')
        unbox = cipherbox.openCB1Box(req.body, keys.key, keys.keyType)
      } else if (keys.cbx === cipherbox.cbType.cb3) {
        debug.processCipherbox('type cb3')
        unbox = cipherbox.openCB3Box(req.body, Buffer.from(keys.key, 'base64'))
      }

      if (!unbox) {
        debug.processCipherbox('unbox failed')
        msgFactory.expressCreateResponse(
          res,
          msgFactory.msgTypes.MSG_ERROR_INVALID_CIPHERBOX
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

      debug.processCipherbox('unbox done')

      // Hijack send function
      let send = res.send
      res.send = (body) => {
        debug.processCipherbox('boxing reply')
        if (typeof body === 'object') {
          body = cipherbox.sealBoxWithCB0(JSON.stringify(body), unbox.key).box
        } else {
          body = cipherbox.sealBoxWithCB0(String(body), unbox.key).box
        }

        debug.processCipherbox('box reply done')

        res.send = send
        return res.send(body)
      }
    }
    next()
  } else if (mandatory) {
    if (req.auth) {
      if (req.auth.terminalId) {
        msgFactory.expressCreateResponse(
          res,
          msgFactory.msgTypes.MSG_ERROR_AUTH_CIPHERBOX_MANDATORY
        )
        return
      }
    }
  }
  next()
}
