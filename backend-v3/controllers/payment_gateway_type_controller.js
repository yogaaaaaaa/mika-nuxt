const model = require('../models/index')
const helpers = require('../helpers/helper')
require('express-async-errors')

module.exports.getAllPaymentGatewayType = async (req, res, next) => {
  var data = await model.payment_gateway_type.findAndCountAll(req.setting)
  if (!data) throw Error(helpers.asyncErrorMessage('get'))
  res.status(200).json(helpers.OutputSuccess(
    data, 'get', helpers.generateMetaPage(req.meta, data, req.limit)
  ))
}

module.exports.getSinglePaymentGatewayType = async (req, res, next) => {
  const data = await helpers.getSingleData('payment_gateway_type', req.params.id)
  if (!data) throw Error(helpers.asyncErrorMessage('get'))
  res.status(200).json(helpers.OutputSuccess(data))
}

module.exports.createPaymentGatewayType = async (req, res, next) => {
  const data = await model.payment_gateway_type.create(req.body)
  if (!data) throw Error(helpers.asyncErrorMessage('create'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'post'))
}

module.exports.updatePaymentGatewayType = async (req, res, next) => {
  const data = await model.payment_gateway_type.update(req.body, {
    where: helpers.generateCondition('id', req.params.id)
  })
  if (!data) throw Error(helpers.asyncErrorMessage('update'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'update'))
}

module.exports.deletePaymentGatewayType = async (req, res, next) => {
  const data = await model.payment_gateway_type.destroy({
    where: helpers.generateCondition('id', req.params.id)
  })
  if (!data) throw Error(helpers.asyncErrorMessage('delete'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'delete'))
}
