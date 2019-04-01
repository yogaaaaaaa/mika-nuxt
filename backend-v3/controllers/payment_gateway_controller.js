const model = require('../models/index')
const helpers = require('../helpers/helper')
require('express-async-errors')

module.exports.getAllPaymentGateway = async (req, res, next) => {
  var data = await model.payment_gateway.findAndCountAll(req.setting)
  data['rows'].sort(sortingPaymentGatewayName)
  if (!data) throw Error(helpers.asyncErrorMessage('get'))
  res.status(200).json(helpers.OutputSuccess(
    data, 'get', helpers.generateMetaPage(req.meta, data, req.limit)
  ))
}

module.exports.getSinglePaymentGateway = async (req, res, next) => {
  const data = await model.payment_gateway.findOne(req.setting)
  if (!data) throw Error(helpers.asyncErrorMessage('get'))
  res.status(200).json(helpers.OutputSuccess(data))
}

module.exports.createPaymentGateway = async (req, res, next) => {
  const data = await model.payment_gateway.create(req.body)
  if (!data) throw Error(helpers.asyncErrorMessage('create'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'post'))
}

module.exports.updatePaymentGateway = async (req, res, next) => {
  const data = await model.payment_gateway.update(req.body, {
    where: helpers.generateCondition('id', req.params.id)
  })
  if (!data) throw Error(helpers.asyncErrorMessage('update'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'update'))
}

module.exports.deletePaymentGateway = async (req, res, next) => {
  const data = await model.payment_gateway.destroy({
    where: helpers.generateCondition('id', req.params.id)
  })
  if (!data) throw Error(helpers.asyncErrorMessage('delete'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'delete'))
}

function sortingPaymentGatewayName(a,b) {
  if (a['dataValues']['payment_gateway_type']['name'] < b['dataValues']['payment_gateway_type']['name'])
    return -1;
  if (a['dataValues']['payment_gateway_type']['name'] > b['dataValues']['payment_gateway_type']['name'])
    return 1;
  return 0;
}
