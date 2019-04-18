'use strict'

const tcash = require('../helpers/ppTcash')
const trxManager = require('../helpers/trxManager')
const models = require('../models')

module.exports.tcashHandleInquiryAndPay = async function (req, res, next) {
  try {
    const transaction = await models.transaction.findOne({
      where: {
        id: req.body.acc_no
      },
      include: [
        {
          model: models.paymentProvider,
          include: [ models.paymentProviderConfig ]
        }
      ]
    })

    if (!transaction) {
      res
        .status(400)
        .send(tcash.tcashErrorResponse(
          tcash.tcashMessageCode.TCASH_ERROR_TRANSACTION_NOT_FOUND)
        )
      return
    }

    let config = tcash.mixConfig(transaction.paymentProvider.paymentProviderConfig.config)

    if (
      (req.body.terminal === config.terminal) &&
      (req.body.pwd === config.pwd) &&
      (req.body.merchant === config.merchant)
    ) {
      if (transaction.transactionStatus !== trxManager.transactionStatuses.CREATED) {
        res.status(400)
          .send(tcash.tcashErrorResponse(
            tcash.tcashMessageCode.TCASH_ERROR_TRANSACTION_NOT_VALID)
          )
        return
      }

      if (req.body.trx_type === tcash.tcashTrxType.TCASH_INQUIRY) {
        res.status(200).send(tcash.tcashInquiryResponse(
          req.body.merchant,
          transaction.id,
          transaction.amount))
        return
      } else if (req.body.trx_type === tcash.tcashTrxType.TCASH_PAY) {
        transaction.transactionStatus = trxManager.transactionStatuses.SUCCESS
        transaction.referenceNumber = req.body.trx_id
        transaction.referenceNumberType = 'trx_id'
        transaction.customerReference = req.body.msisdn
        transaction.customerReferenceType = 'msisdn'
        await transaction.save()

        trxManager.emitTransactionEvent(
          trxManager.transactionEvents.SUCCESS,
          transaction.id
        )
        res
          .status(200)
          .send(tcash.tcashPayResponse(
            req.body.trx_id,
            transaction.id)
          )
        return
      }
    }
  } catch (error) {
    console.error(error)
  }

  res.status(500).send(tcash.tcashErrorResponse())
}
