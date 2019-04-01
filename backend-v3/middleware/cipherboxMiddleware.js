'use strict'

const msgFactory = require('../helpers/msgFactory')
const cipherbox = require('../helpers/cipherbox')
const models = require('../models')

/**
 * Middleware to transparently encrypt and decrypt any supported cipherbox
*/
module.exports.cipherbox = async function (req, res, next) {
  try {
    if (req.body.cbx && req.body.id) {
      let keyData = await models.cipherboxKey.findOne({
        where: {
          idKey: req.body.id
        }
      })
      if (keyData) {
        let keys = JSON.parse(keyData.keys)
        let unbox = null

        if (keys.cbx === cipherbox.cbType.cb0) {
          unbox = cipherbox.openCB0Box(req.body, Buffer.from(keys.key, 'base64'))
        } else if (keys.cbx === cipherbox.cbType.cb1) {
          unbox = cipherbox.openCB1Box(req.body, keys.key, keys.keyType)
        } else if (keys.cbx === cipherbox.cbType.cb3) {
          unbox = cipherbox.openCB3Box(req.body, Buffer.from(keys.key, 'base64'))
        }

        req.cipherbox = {
          cipherboxKeyId: keyData.id,
          terminalId: keyData.terminalId
        }

        if (!unbox) {
          msgFactory.expressCreateResponseMessage(
            msgFactory.messageTypes.MSG_ERROR_INVALID_CIPHERBOX
          )
          return
        }

        // We assume data is JSON, fingers cross
        // if its not, just convert to string
        try {
          req.body = JSON.parse(unbox.data)
        } catch (error) {
          req.body = unbox.data.toString()
        }

        // hijack send function
        let send = res.send
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
    }
  } catch (err) {}
  next()
}
