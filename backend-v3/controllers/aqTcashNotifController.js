'use strict'

const tcash = require('../libs/aqTcash')
const trxManager = require('../libs/trxManager')
const models = require('../models')

module.exports.tcashHandleInquiryAndPay = async function (req, res, next) {
  try {
    const transaction = await models.transaction.findOne({
      where: {
        id: req.body.acc_no
      },
      include: [{
        required: true,
        model: models.acquirer.scope('id'),
        include: [
          {
            model: models.acquirerConfig,
            where: { handler: tcash.handlerName }
          }
        ]
      }]
    })

    if (!transaction) {
      res
        .status(400)
        .send(tcash.tcashErrorResponse(
          tcash.tcashMessageCode.TCASH_ERROR_TRANSACTION_NOT_FOUND)
        )
      return
    }

    const config = tcash.mixConfig(transaction.acquirer.acquirerConfig.config)

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
        transaction.reference = req.body.trx_id
        transaction.referenceName = 'trx_id'
        transaction.customerReference = req.body.msisdn
        transaction.customerReferenceName = 'msisdn'

        await models.sequelize.transaction(async t => {
          await transaction.save({ transaction: t })
          await trxManager.emitTransactionEvent(transaction, t)
        })

        res
          .status(200)
          .send(tcash.tcashPayResponse(
            req.body.trx_id,
            transaction.id)
          )
        return
      }
    }
  } catch (err) {
    console.error(err)
  }

  res.status(500).send(tcash.tcashErrorResponse())
}
