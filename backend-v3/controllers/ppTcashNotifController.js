'use strict'

const tcash = require('../helpers/ppTcash')
const transactionManager = require('../helpers/trxManager')

module.exports.tcashHandleInquiryAndPay = async function (req, res, next) {
  try {
    const transactionData = await transactionManager.getTransactionData(req.body.acc_no)

    if (!transactionData) {
      res.status(400)
        .send(tcash.tcashErrorResponse(
          tcash.tcashMessageCode.TCASH_ERROR_TRANSACTION_NOT_FOUND)
        )
      return
    }

    let config = {
      tcashTerminalName: transactionData.payment_gateway.terminal_username,
      tcashTerminalPassword: transactionData.payment_gateway.terminal_password
    }

    if (
      (req.body.terminal.toLowerCase() === config.tcashTerminalName.toLowerCase()) &&
      (req.body.pwd.toLowerCase() === config.tcashTerminalPassword.toLowerCase())
    ) {
      if (transactionData.transaction_status_id !== transactionManager.transactionStatus.INQUIRY.id) {
        res.status(400)
          .send(tcash.tcashErrorResponse(
            tcash.tcashMessageCode.TCASH_ERROR_TRANSACTION_NOT_VALID)
          )
        return
      }

      if (req.body.trx_type === tcash.tcashTrxType.TCASH_INQUIRY) {
        res.status(200).send(tcash.tcashInquiryResponse(
          req.body.merchant,
          transactionData.id,
          transactionData.amount))
        return
      } else if (req.body.trx_type === tcash.tcashTrxType.TCASH_PAY) {
        const transactionUpdate = await transactionManager.updateTransactionData({
          customer: req.body.msisdn,
          reference_number: req.body.trx_id,
          transaction_status_id: transactionManager.transactionStatus.SUCCESS.id
        },
        transactionData.id)

        if (transactionUpdate) {
          transactionManager.emitTransactionEvent(
            transactionManager.transactionEvent.SUCCESS,
            transactionData.id
          )

          res.status(200).send(tcash.tcashPayResponse(
            req.body.trx_id,
            transactionData.id))

          return
        }
      }
    }
  } catch (error) {
    console.log(error)
  }

  res.status(500).send(tcash.tcashErrorResponse())
}
