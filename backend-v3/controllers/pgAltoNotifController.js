'use strict'

const alto = require('../helpers/pgAlto')
const transactionManager = require('../helpers/transactionManager')

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
      let requestData = JSON.parse(req.body.data)
      const transactionData = await transactionManager.getTransactionData(requestData.out_trade_no)

      if (
        transactionData &&
        config.mch_id === requestData.mch_id
      ) {
        if (parseInt(requestData.trade_status) === 1) {
          if (
            transactionData.transaction_status_id === transactionManager.transactionStatus.INQUIRY.id &&
            parseInt(transactionData.amount) === parseInt(requestData.amount)
          ) {
            await transactionManager.updateTransactionData({
              transaction_status_id: transactionManager.transactionStatus.SUCCESS.id,
              reference_number: requestData.trade_no
            }, requestData.out_trade_no)

            transactionManager.emitTransactionEvent(transactionManager.transactionEvent.SUCCESS, transactionData.id)

            res.type('text').send('SUCCESS')
            return
          } else if (transactionData.transaction_status_id === transactionManager.transactionStatus.FAILED.id) {
            // Invalid transaction, we need to refund
            let altoRefundResponse = await alto.altoRefundPayment(Object.assign({}, config, {
              out_trade_no: requestData.out_trade_no,
              out_refund_no: `ref${requestData.out_trade_no}`,
              refund_amount: parseInt(requestData.amount),
              amount: parseInt(requestData.amount)
            }))

            if (parseInt(altoRefundResponse.result) === 0) {
              res.type('text').send('SUCCESS')
              return
            }
          }
        } else if (requestData.refund_status) {
          // TODO: What to handle when refund is failed, try refunding ?
          // Possible solution is to try refunding with different id
          await transactionManager.updateTransactionData({
            reference_number: requestData.out_refund_no
          }, requestData.out_trade_no)

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
