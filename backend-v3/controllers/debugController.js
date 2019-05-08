'use strict'

const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')
const trxManager = require('../helpers/trxManager')

const msgFactory = require('../helpers/msgFactory')

/**
 * Controller to forcefully change transaction status
 */
module.exports.changeTransactionStatus = async (req, res, next) => {
  let transaction = await trxManager.forceStatus(req.params.transactionId, req.params.transactionStatus)
  if (transaction) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS,
      transaction
    )
  } else {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_ERROR_BAD_REQUEST
    )
  }
}

module.exports.echo = [
  cipherboxMiddleware.processCipherbox(),
  (req, res, next) => {
    res.send(req.body)
  }
]
