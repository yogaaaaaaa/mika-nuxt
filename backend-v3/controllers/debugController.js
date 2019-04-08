'use strict'

const cipherboxMiddleware = require('../middleware/cipherboxMiddleware')

const trxManager = require('../helpers/trxManager')

/**
 * Controller to forcefully change transaction status
 */
module.exports.changeTransactionStatus = async (req, res, next) => {
  try {
    await trxManager.forceTransactionStatus(req.params.transactionId, req.params.transactionStatus)
    res.status(200).type('text').send('DEBUG:OK')
  } catch (err) {
    res.status(500).type('text').send('DEBUG:ERROR')
  }
}

module.exports.echoCipherbox = [
  cipherboxMiddleware.cipherbox,
  (req, res, next) => {
    res.send(req.body)
  }
]
