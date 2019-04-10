'use strict'

const alto = require('../helpers/ppAlto')
const trxManager = require('../helpers/trxManager')

/**
 * Handle request of Alto pay and  notification
 */
module.exports.altoHandleNotification = [
  async (req, res, next) => {
    try {
      let config = alto.baseConfig
      let request = JSON.parse(req.body.data)
      const transaction = await trxManager.getTransaction(request.out_trade_no)
      if (!transaction) next()
      Object.assign(config, transaction.paymentProvider.paymentProviderConfig)
      if (!alto.altoVerifyContainer(config.pemAltoPublicKey, req.body)) next()

      if (config.mch_id !== request.mch_id) next()

      if (parseInt(request.trade_status) === 1) {
        if (
          transaction.transactionStatus === trxManager.transactionStatuses.CREATED &&
          parseInt(transaction.amount) === parseInt(request.amount)
        ) {
          await trxManager.updateTransaction({
            transactionStatus: trxManager.transactionStatuses.SUCCESS,
            referenceNumber: request.trade_no,
            referenceNumberType: 'trade_no'
          }, request.out_trade_no)
          trxManager.emitTransactionEvent(trxManager.transactionEvents.SUCCESS, transaction.id)
          return (res.type('text').send('SUCCESS'))
        } else if (transaction.transactionStatus === trxManager.transactionStatuses.FAILED) {
          // Invalid transaction, we need to refund
          let altoRefundResponse = await alto.altoRefundPayment(Object.assign({}, config, {
            out_trade_no: request.out_trade_no,
            out_refund_no: `ref${request.out_trade_no}`,
            refund_amount: parseInt(request.amount),
            amount: parseInt(request.amount)
          }))

          if (parseInt(altoRefundResponse.result) === 0) {
            return (res.type('text').send('SUCCESS'))
          }
        }
      } else if (request.refund_status) {
        // TODO: What to handle when refund is failed, try refunding ?
        // Possible solution is to try refunding with different id
        await trxManager.updateTransaction({
          extra: [
            {
              name: 'Refund Number',
              type: 'out_refund_no',
              value: request.out_refund_no
            }
          ]
        }, request.out_trade_no)

        res.type('text').send('SUCCESS')
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
