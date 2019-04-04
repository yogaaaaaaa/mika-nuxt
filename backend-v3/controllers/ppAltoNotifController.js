'use strict'

const alto = require('../helpers/ppAlto')
const trxManager = require('../helpers/trxManager')

/**
 * Handle request of Alto pay and  notification
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
module.exports.altoHandleNotification = async function (req, res, next) {
  try {
    let config = alto.baseConfig

    if (alto.altoVerifyContainer(config.pemAltoPublicKey, req.body)) {
      let request = JSON.parse(req.body.data)
      const transaction = await trxManager.getTransaction(request.out_trade_no)

      if (
        transaction &&
        config.mch_id === request.mch_id
      ) {
        if (parseInt(request.trade_status) === 1) {
          if (
            transaction.transactionStatus === trxManager.transactionStatuses.INQUIRY &&
            parseInt(transaction.amount) === parseInt(request.amount)
          ) {
            await trxManager.updateTransaction({
              transactionStatus: trxManager.transactionStatuses.SUCCESS,
              referenceNumber: request.trade_no,
              referenceNumberType: 'trade_no'
            }, request.out_trade_no)

            trxManager.emitTransactionEvent(trxManager.transactionEvents.SUCCESS, transaction.id)

            res.type('text').send('SUCCESS')
            return
          } else if (transaction.transactionStatus === trxManager.transactionStatuses.FAILED) {
            // Invalid transaction, we need to refund
            let altoRefundResponse = await alto.altoRefundPayment(Object.assign({}, config, {
              out_trade_no: request.out_trade_no,
              out_refund_no: `ref${request.out_trade_no}`,
              refund_amount: parseInt(request.amount),
              amount: parseInt(request.amount)
            }))

            if (parseInt(altoRefundResponse.result) === 0) {
              res.type('text').send('SUCCESS')
              return
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
      }
    }

    res.status(500).type('text').send('ERROR')
  } catch (error) {
    res.status(500).type('text').send('ERROR')
  }
}
