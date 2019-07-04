'use strict'

const msg = require('../libs/msg')
const models = require('../models')

const { body } = require('express-validator')

const errorMiddleware = require('../middlewares/errorMiddleware')

const defaultValidator = [
  body('outletIds')
    .isArray(),
  body('outletIds')
    .custom((value) => (value.length < 50) && (value.length > 0))
    .withMessage('Too many ids (maximum is 50)')
]

module.exports.associateOutlets = async (req, res, next) => {
  let merchantStaff
  let failedOutletIds = []

  await models.sequelize.transaction(async t => {
    merchantStaff = await models.merchantStaff.findByPk(req.params.merchantStaffId, { transaction: t })
    if (merchantStaff) {
      for (const outletId of req.body.outletIds) {
        let outlet = await models.outlet.findByPk(outletId, { transaction: t })
        if (outlet && (merchantStaff.merchantId === outlet.merchantId)) {
          try {
            await models.merchantStaffOutlet.create({
              outletId: outletId,
              merchantStaffId: req.params.merchantStaffId
            }, { transaction: t })
            continue
          } catch (err) {}
        }
        failedOutletIds.push(outletId)
      }
    }
  })

  msg.expressAssociateEntityResponse(
    res,
    merchantStaff,
    failedOutletIds,
    req.body.outletIds.length
  )
}

module.exports.dissociateOutlets = async (req, res, next) => {
  let merchantStaff
  let failedOutletIds = []

  await models.sequelize.transaction(async t => {
    merchantStaff = await models.merchantStaff.findByPk(req.params.merchantStaffId, { transaction: t })
    if (merchantStaff) {
      for (const outletId of req.body.outletIds) {
        try {
          if (!await models.merchantStaffOutlet.destroy({
            where: {
              outletId: outletId,
              merchantStaffId: req.params.merchantStaffId
            },
            transaction: t
          })) {
            throw Error()
          }
          continue
        } catch (err) {}
        failedOutletIds.push(outletId)
      }
    }
  })

  msg.expressDissociateEntityResponse(
    res,
    merchantStaff,
    failedOutletIds,
    req.body.outletIds.length
  )
}

module.exports.associateOutletsMiddlewares = [
  defaultValidator,
  errorMiddleware.validatorErrorHandler,
  exports.associateOutlets
]

module.exports.dissociateOutletsMiddlewares = [
  defaultValidator,
  exports.dissociateOutlets
]
