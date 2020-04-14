'use strict'

const bodyParser = require('body-parser')
const dana = require('libs/trxManager/handlers/dana')
const trxManager = require('libs/trxManager')
const models = require('models')
const { decimalAmountPaddedParse } = require('libs/format')
const debug = require('debug')('mika:dana:notif')
const moment = require('moment')
// const { createDivision } = require('../libs/aqDana')
const { generateSignature, verifySignature } = require('libs/aqDana/util')

/**
 * Callback handler to notify if transaction is succeeded or not
 */
module.exports.danaNotifHandle = async (req, res, next) => {
  debug('====== Dana Notify Handle ======')

  let danaResponse = {}
  if (!req.rawBody) {
    return res.status(204).send({ message: 'No Content' })
  }

  danaResponse = JSON.parse(req.rawBody)
  debug('Dana Finish Notify Data', JSON.stringify(danaResponse))
  const verified = verifySignature(
    danaResponse.request,
    danaResponse.signature
  )
  debug('verified:', verified)
  if (!verified) {
    return res.status(403).send({ message: 'Message not verified' })
  }

  // Get Transaction Data
  const { body } = danaResponse.request
  const transaction = await models.transaction.findOne({
    where: {
      id: body.merchantTransId,
      amount: decimalAmountPaddedParse(body.orderAmount.value)
      // status: trxManager.transactionStatuses.CREATED
    },
    include: [
      {
        required: true,
        model: models.acquirer.scope('id'),
        include: [
          {
            model: models.acquirerConfig,
            where: { handler: 'dana' }
          }
        ]
      }
    ]
  })

  if (!transaction) {
    debug('no transaction')
    return sendAck(res, danaResponse)
  }

  transaction.reference = danaResponse.request.body.acquirementId
  transaction.referenceName = 'acquirementId'

  const notAllowedStatus = ['expired', 'canceled', 'reversed']
  if (notAllowedStatus.includes(transaction.status)) {
    debug('transaction status in [expired, canceled, reversed]')

    if (danaResponse.request.body.acquirementStatus !== 'CLOSED') {
      dana.cancelHandler({ transaction })
    }
    return sendAck(res, danaResponse)
  }

  if (danaResponse.request.body.acquirementStatus === 'CLOSED') {
    transaction.status = trxManager.transactionStatuses.EXPIRED
  }
  if (danaResponse.request.body.acquirementStatus === 'SUCCESS') {
    transaction.status = trxManager.transactionStatuses.SUCCESS
  }

  await models.sequelize.transaction(async t => {
    await transaction.save({ transaction: t })
    await trxManager.emitTransactionEvent(transaction, t)
  })
  return sendAck(res, danaResponse)
}

/**
 * Acknowledge to be sent after finish notification received from Dana
 * @param {*} ack
 */
async function generateAck (ack) {
  const signature = generateSignature(ack.response)
  ack.signature = signature
  return ack
}

/**
 * Send Acknowledge to Dana Server
 */
const sendAck = async (res, danaResponse) => {
  const now = moment()
  const ackResponse = {
    response: {
      body: {
        resultInfo: {
          resultStatus: 'S',
          resultCodeId: '00000000',
          resultCode: 'SUCCESS',
          resultMsg: 'success'
        }
      }
    }
  }
  ackResponse.response.head = {
    ...danaResponse.request.head,
    respTime: now.format()
  }
  delete ackResponse.response.head.reqTime
  const ack = await generateAck(ackResponse)
  debug('dana ack:', JSON.stringify(ack))
  return res.status(200).send(ack)
}

const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8')
  }
}

module.exports.danaNotifHandleMiddlewares = [
  bodyParser.raw({
    verify: rawBodySaver,
    type: () => {
      return true
    }
  }),
  exports.danaNotifHandle
]
