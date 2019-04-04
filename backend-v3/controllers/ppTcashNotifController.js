'use strict'

const tcash = require('../helpers/ppTcash')
const trxManager = require('../helpers/trxManager')

module.exports.tcashHandleInquiryAndPay = async function (req, res, next) {
  try {
    const transaction = await trxManager.getTransaction(req.body.acc_no)

    if (!transaction) {
      res.status(400)
        .send(tcash.tcashErrorResponse(
          tcash.tcashMessageCode.TCASH_ERROR_TRANSACTION_NOT_FOUND)
        )
      return
    }

    let config = {
      tcashTerminalName: transaction.paymentProvider.paymentProviderConfig.config.username,
      tcashTerminalPassword: transaction.paymentProvider.paymentProviderConfig.config.username
    }

    if (
      (req.body.terminal.toLowerCase() === config.tcashTerminalName.toLowerCase()) &&
      (req.body.pwd.toLowerCase() === config.tcashTerminalPassword.toLowerCase())
    ) {
      if (transaction.transactionStatus !== trxManager.transactionStatuses.INQUIRY) {
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
        const updatedTransaction = await trxManager.updateTransaction({
          customerReference: req.body.msisdn,
          customerReferenceType: 'msisdn',
          referenceNumber: req.body.trx_id,
          referenceNumberType: 'trx_id',
          transactionStatus: trxManager.transactionStatuses.SUCCESS
        },
        transaction.id)

        if (updatedTransaction) {
          trxManager.emitTransactionEvent(
            trxManager.transactionEvents.SUCCESS,
            transaction.id
          )

          res.status(200).send(tcash.tcashPayResponse(
            req.body.trx_id,
            transaction.id))

          return
        }
      }
    }
  } catch (error) {
    console.log(error)
  }

  res.status(500).send(tcash.tcashErrorResponse())
}
