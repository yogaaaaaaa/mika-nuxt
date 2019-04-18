'use strict'

const midtrans = require('../helpers/ppMidtrans')
const trxManager = require('../helpers/trxManager')
const models = require('../models')

module.exports.midtransHandleNotification = async function (req, res, next) {
  try {
    if (req.body.transaction_status !== 'settlement' || req.body.payment_type !== 'gopay') {
      res.status(200).type('text').send('NOT INTERESTED, BUT OK')
      return
    }

    /**
     * @NOTE
     * Midtrans is using decimal (real number) in string format to represent gross_amount
     * and MIKA system is using integer
     */
    const transaction = await models.transaction.findOne({
      where: {
        id: req.body.order_id,
        amount: parseInt(req.body.gross_amount),
        referenceNumber: req.body.transaction_id,
        transactionStatus: trxManager.transactionStatuses.CREATED
      },
      include: [
        {
          model: models.paymentProvider,
          include: [ models.paymentProviderConfig ]
        }
      ]
    })

    if (!transaction) {
      res.status(400).type('text').send('TRANSACTION NOT FOUND')
      return
    }

    if (
      !midtrans.checkNotificationSignature(
        req.body.signature_key,
        Object.assign({
          status_code: req.body.status_code,
          order_id: req.body.order_id,
          gross_amount: req.body.gross_amount
        }, transaction.paymentProvider.paymentProviderConfig)
      )
    ) {
      res.status(401).type('text').send('UNAUTHORIZED')
      return
    }

    transaction.transactionStatus = trxManager.transactionStatuses.SUCCESS
    await transaction.save()
    trxManager.emitTransactionEvent(
      trxManager.transactionEvents.SUCCESS,
      transaction.id
    )
    res.status(200).type('text').send('OK')
  } catch (error) {
    console.error(error)
    res.status(500).type('text').send('ERROR')
  }
}
