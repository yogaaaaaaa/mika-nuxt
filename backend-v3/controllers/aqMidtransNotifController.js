'use strict'

const midtrans = require('../libs/aqMidtrans')
const trxManager = require('../libs/trxManager')
const models = require('../models')

module.exports.midtransHandleNotification = async function (req, res, next) {
  try {
    if (req.body.transaction_status !== 'settlement' || req.body.payment_type !== 'gopay') {
      res.status(200).type('text').send('NOT INTERESTED, BUT OK')
      return
    }

    const transaction = await models.transaction.findOne({
      where: {
        id: req.body.order_id,
        amount: req.body.gross_amount,
        referenceNumber: req.body.transaction_id,
        status: trxManager.transactionStatuses.CREATED
      },
      include: [{
        required: true,
        model: models.acquirer.scope('id'),
        include: [
          {
            model: models.acquirerConfig.scope('acquirerConfigKv'),
            where: { handler: midtrans.handlerName }
          }
        ]
      }]
    })

    if (!transaction) {
      res.status(400).type('text').send('TRANSACTION NOT FOUND')
      return
    }

    let midtransConfig = midtrans.mixConfig(transaction.acquirer.acquirerConfig.config)

    if (!midtrans.checkNotificationSignature(Object.assign(req.body, midtransConfig))) {
      res.status(401).type('text').send('UNAUTHORIZED')
      return
    }

    transaction.status = trxManager.transactionStatuses.SUCCESS
    await transaction.save()
    trxManager.emitStatusChange(transaction)
    res.status(200).type('text').send('OK')
  } catch (err) {
    console.error(err)
    res.status(500).type('text').send('ERROR')
  }
}
