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
      include: [ models.paymentProvider.scope('paymentProviderConfig') ]
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
      (req.body.terminal === config.tcashTerminal) &&
      (req.body.pwd === config.tcashPwd) &&
      (req.body.merchant === config.tcashMerchant)
    ) {
      if (transaction.status !== trxManager.transactionStatuses.CREATED) {
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
        transaction.status = trxManager.transactionStatuses.SUCCESS
        transaction.referenceNumber = req.body.trx_id
        transaction.referenceNumberName = 'trx_id'
        transaction.customerReference = req.body.msisdn
        transaction.customerReferenceName = 'msisdn'
        await transaction.save()

        trxManager.emitStatusChange(transaction)

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
