'use strict'

const alto = require('../helpers/ppAlto')
const models = require('../models')
const trxManager = require('../helpers/trxManager')

/**
 * Handle request of Alto pay and  notification
 */
module.exports.altoHandleNotification = [
  async (req, res, next) => {
    try {
      let data = JSON.parse(req.body.data)

      const transaction = await models.transaction.findOne({
        where: {
          id: data.out_trade_no,
          referenceNumber: data.trade_no,
          amount: parseInt(data.amount)
        },
        include: [
          {
            model: models.paymentProvider,
            include: [ models.paymentProviderConfig ]
          }
        ]
      })
      if (!transaction) next()

      let config = alto.mixConfig(transaction.paymentProvider.paymentProviderConfig)

      if (!alto.altoVerifyContainer(config.pemAltoPublicKey, req.body)) next()
      if (config.mch_id !== data.mch_id) next()

      if (parseInt(data.trade_status) === 1) {
        if (transaction.transactionStatus === trxManager.transactionStatuses.CREATED) {
          transaction.transactionStatus = trxManager.transactionStatuses.SUCCESS
          await transaction.save()

          trxManager.emitTransactionEvent(
            trxManager.transactionEvents.SUCCESS,
            transaction.id
          )

          res.status(200).type('text').send('SUCCESS')
          return
        } else if (transaction.transactionStatus === trxManager.transactionStatuses.FAILED) {
          // Invalid transaction, we need to refund
          let response = await alto.altoRefundPayment(Object.assign({
            out_trade_no: data.out_trade_no,
            out_refund_no: `refund-${data.out_trade_no}`,
            refund_amount: parseInt(data.amount),
            amount: parseInt(data.amount)
          }, config))

          if (parseInt(response.result) === 0) {
            res.status(200).type('text').send('SUCCESS')
            return
          }
        }
      } else if (data.refund_status) {
        // TODO: What to handle when refund is failed, try refunding ?
        // Possible solution is to try refunding with different id
        transaction.extra = [
          {
            name: 'out_refund_no',
            value: data.out_refund_no,
            type: 'extraReferenceNumber',
            description: 'Refund Reference Number'
          }
        ]
        await transaction.save()

        res.status(200).type('text').send('SUCCESS')
        return
      }
    } catch (err) {
      console.error(err)
    }
    next()
  },
  async (req, res, next) => {
    res.status(500).type('text').send('ERROR')
  }
]
