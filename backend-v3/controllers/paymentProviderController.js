'use strict'

const trxManager = require('../helpers/trxManager')
const msgFactory = require('../helpers/msgFactory')
const models = require('../models')

/**
 * Get one or many agent's payment providers (via `req.auth.userType`)
 */
module.exports.getAgentPaymentProviders = async (req, res, next) => {
  let query = {
    where: {
      agentId: req.auth.agentId
    },
    attributes: ['id'],
    include: [
      {
        model: models.paymentProvider,
        attributes: {
          exclude: [
            'shareMerchant',
            'shareMerchantWithPartner',
            'sharePartner',
            'directSettlement',
            'createdAt',
            'updatedAt',
            'deletedAt'
          ]
        },
        include: [
          {
            model: models.paymentProviderType,
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'deletedAt'
              ]
            }
          },
          {
            model: models.paymentProviderConfig,
            attributes: {
              exclude: [
                'config',
                'providerIdReference',
                'providerIdType',
                'createdAt',
                'updatedAt',
                'deletedAt'
              ]
            }
          }
        ]
      }
    ]
  }

  if (req.params.id) {
    query.where.id = req.params.id
    let paymentProvider = await models.agentPaymentProvider.findOne(query)
    if (paymentProvider) {
      msgFactory.expressCreateResponseMessage(
        res,
        msgFactory.messageTypes.MSG_SUCCESS_ENTITY_RETRIEVED,
        paymentProvider
      )
    } else {
      msgFactory.expressCreateResponseMessage(
        res,
        msgFactory.messageTypes.MSG_ERROR_ENTITY_NOT_FOUND
      )
    }
  } else {
    let paymentProviders = await models.agentPaymentProvider.findAll()
    if (paymentProviders) {
      msgFactory.expressCreateResponseMessage(
        res,
        msgFactory.messageTypes.MSG_SUCCESS_ENTITY_RETRIEVED,
        paymentProviders.map((data) => {
          let paymentProvider = data.paymentProvider.toJSON()

          let ppHandler = trxManager.findPpHandler(data.paymentProvider.paymentProviderConfig.handler)

          paymentProvider._handler = {
            name: ppHandler.name,
            aliases: ppHandler.aliases,
            properties: ppHandler.properties
          }

          return paymentProvider
        })
      )
    }
  }
}
