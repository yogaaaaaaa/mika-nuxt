'use strict'

const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')
const trxManager = require('../helpers/trxManager')

const msg = require('../helpers/msg')

/**
 * Controller to forcefully change transaction status
 */
module.exports.changeTransactionStatus = async (req, res, next) => {
  let transaction = await trxManager.forceStatus(req.params.transactionId, req.params.transactionStatus)
  if (transaction) {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS,
      transaction
    )
  } else {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_ERROR_BAD_REQUEST
    )
  }
}

module.exports.echo = [
  cipherboxMiddleware.processCipherbox(),
  (req, res, next) => {
    res.send(req.body)
  }
]
