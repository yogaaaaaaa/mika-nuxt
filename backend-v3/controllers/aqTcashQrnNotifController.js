'use strict'

const { body, validationResult } = require('express-validator')
const bodyParser = require('body-parser')

const tcashQrn = require('../libs/aqTcashQrn')
const trxManager = require('../libs/trxManager')
const models = require('../models')

const bodyParserJson = bodyParser.json()

module.exports.tcashQrnHandleInformPayValidator = [
  body('msg')
    .exists(),
  body('amount')
    .isNumeric(),
  body('merchant')
    .exists(),
  body('pwd')
    .exists(),
  body('trx_id')
    .exists(),
  body('msisdn')
    .exists(),
  (req, res, next) => {
    const validationErrors = validationResult(req).array()
    if (validationErrors.length > 0) {
      res
        .status(400)
        .send(tcashQrn.notifResponseMsg.BAD_REQUEST)
    } else {
      next()
    }
  }
]

module.exports.tcashQrnHandleInformPay = async function (req, res, next) {
  try {
    const transaction = await models.transaction.findOne({
      where: {
        id: req.body.msg,
        status: trxManager.transactionStatuses.CREATED
      },
      include: [
        {
          required: true,
          model: models.acquirer.scope('id'),
          include: [
            {
              model: models.acquirerConfig,
              where: { handler: tcashQrn.handlerName }
            }
          ]
        }
      ]
    })

    if (!transaction) {
      res
        .status(404)
        .send(tcashQrn.notifResponseMsg.INVALID_TRANSACTION)
      return
    }

    // TODO: Use more proper toFixed
    if (transaction.amount !== req.body.amount.toFixed(2)) {
      res
        .status(400)
        .send(tcashQrn.notifResponseMsg.INVALID_AMOUNT)
      return
    }

    const config = tcashQrn.mixConfig(transaction.acquirer.acquirerConfig.config)

    if (
      (req.body.merchant === config.tcashQrnMerchantID) &&
      (req.body.pwd === config.tcashQrnPwd)
    ) {
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
        .send({
          ...tcashQrn.notifResponseMsg.SUCCESS,
          transactionID: transaction.id
        })
    } else {
      res
        .status(401)
        .send(tcashQrn.notifResponseMsg.UNAUTHORIZED)
    }
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .send(tcashQrn.notifResponseMsg.SERVER_ERROR)
  }
}

module.exports.tcashQrnHandleInformPayMiddlewares = [
  bodyParserJson,
  exports.tcashQrnHandleInformPayValidator,
  exports.tcashQrnHandleInformPay
]
