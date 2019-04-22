'use strict'

const models = require('../models')
const msgFactory = require('../helpers/msgFactory')

/**
 * Get current agent's (via `req.auth.userType`)
 */
module.exports.getAgent = async (req, res, next) => {
  let query = {
    where: {
      id: req.auth.agentId
    },
    attributes: {
      exclude: [
        'deletedAt'
      ]
    },
    include: [
      {
        model: models.merchant,
        attributes: {
          exclude: [
            'idTaxCard',
            'scannedTaxCardResourceId',
            'bankName',
            'bankBranchName',
            'bankAccountName',
            'bankAccountNumber',
            'scannedBankStatementResourceId',
            'scannedSkmenkumhamResourceId',
            'scannedSiupResourceId',
            'scannedTdpResourceId',
            'scannedSkdpResourceId',
            'ownerIdCardNumber',
            'ownerIdCardType',
            'ownerTaxCardNumber',
            'ownerScannedIdCardResourceId',
            'ownerScannedTaxCardResourceId',
            'userId',
            'partnerId',
            'deletedAt'
          ]
        }
      },
      {
        model: models.outlet,
        attributes: {
          exclude: [
            'ownershipType',
            'rentStartDate',
            'restDurationMonth',
            'otherPaymentSystems',
            'outletPhotoResourceId',
            'cashierDeskPhotoResourceId',
            'businessDurationMonth',
            'businessMonthlyTurnover',
            'merchantId',
            'deletedAt'
          ]
        }
      }
    ]
  }

  let agent = await models.agent.findOne(query)

  msgFactory.expressCreateResponse(
    res,
    agent ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND : msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND,
    agent
  )
}
