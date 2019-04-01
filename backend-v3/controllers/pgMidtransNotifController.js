'use strict'

const midtrans = require('../helpers/pgMidtrans')
const transactionManager = require('../helpers/transactionManager')

module.exports.midtransHandleNotification = async function (req, res, next) {
  try {
    // let config = midtrans.baseConfig

    const transactionData = await transactionManager.getTransactionData(req.body.order_id)

    if (!transactionData) {
      res.status(404).type('text').send('TRANSACTION NOT FOUND')
      return
    }

    /**
     * @NOTE
     * Midtrans is using decimal (real number) in string format to represent gross_amount
     * and MIKA system is using integer
     */
    if (parseInt(transactionData.amount) !== parseInt(req.body.gross_amount)) {
      res.status(404).type('text').send('TRANSACTION NOT FOUND')
      return
    }

    if (
      midtrans.checkNotificationSignature(req.body.signature_key, {
        status_code: req.body.status_code,
        order_id: req.body.order_id,
        gross_amount: req.body.gross_amount
      })
    ) {
      if (req.body.payment_type === 'gopay') {
        if (transactionData.transaction_status_id === transactionManager.transactionStatus.INQUIRY.id) {
          if (req.body.transaction_status === 'settlement') {
            transactionManager.updateTransactionData({
              transaction_status_id: transactionManager.transactionStatus.SUCCESS.id
            }, transactionData.id)
            transactionManager.emitTransactionEvent(transactionManager.transactionEvent.SUCCESS, transactionData.id)
          }
        }
      }
      res.status(200).type('text').send('OK')
    } else {
      res.status(401).type('text').send('UNAUTHORIZED')
    }
  } catch (error) {
    res.status(500).type('text').send('ERROR')
  }
}
