'use strict'

const trxManager = require('../helpers/trxManager')
const msgFactory = require('../helpers/msgFactory')
const models = require('../models')

const auth = require('../helpers/auth')

/**
 * Get one or many payment provider (dependent with `req.auth.userType`)
 */
module.exports.getAgentPaymentProviders = async (req, res, next) => {
  if (req.params.id) {
    msgFactory.expressCreateResponseMessage(
      res,
      msgFactory.messageTypes.MSG_ERROR_NOT_IMPLEMENTED
    )
  }

  let paymentProviders = await models.agentPaymentProvider.findAll({
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
  })

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
