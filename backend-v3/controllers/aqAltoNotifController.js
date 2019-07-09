'use strict'

const alto = require('../libs/aqAlto')
const models = require('../models')
const trxManager = require('../libs/trxManager')

/**
 * Handle request of Alto pay and  notification
 */
module.exports.altoHandleNotification = [
  async (req, res, next) => {
    try {
      let data = JSON.parse(req.body.data)

      const transaction = await models.transaction.scope('transactionExtraKv').findOne({
        where: {
          id: data.out_trade_no,
          referenceNumber: data.trade_no,
          amount: data.amount
        },
        include: [ models.acquirer.scope('acquirerConfig') ]
      })
      if (!transaction) next()

      let altoConfig = alto.mixConfig(transaction.acquirer.acquirerConfig)

      if (!alto.altoVerifyContainer(altoConfig.altoPemAltoPublicKey, req.body)) next()
      if (altoConfig.mch_id !== data.mch_id) next()

      if (parseInt(data.trade_status) === 1) {
        if (transaction.status === trxManager.transactionStatuses.CREATED) {
          transaction.status = trxManager.transactionStatuses.SUCCESS
          await transaction.save()

          trxManager.emitStatusChange(transaction)

          res.status(200).type('text').send('SUCCESS')
          return
        } else if (transaction.status === trxManager.transactionStatuses.FAILED) {
          // Invalid transaction, we need to refund
          let response = await alto.altoRefundPayment(Object.assign({
            out_trade_no: data.out_trade_no,
            out_refund_no: `ref${data.out_trade_no}`,
            refund_amount: parseInt(data.amount),
            amount: parseInt(data.amount)
          }, altoConfig))

          if (parseInt(response.result) === 0) {
            res.status(200).type('text').send('SUCCESS')
            return
          }
        }
      } else if (data.refund_status) {
        // TODO: What to handle when refund is failed, try refunding ?
        // Possible solution is to try refunding with different id
        await models.sequelize.transaction(async t => {
          let transactionExtra = transaction.extra
          transactionExtra.out_refund_no = data.out_refund_no
          await models.transactionExtraKv.setKv(transaction.id, transactionExtra, t)
          transaction.changed('updatedAt', true)
          await transaction.save({ transaction: t })
        })

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
