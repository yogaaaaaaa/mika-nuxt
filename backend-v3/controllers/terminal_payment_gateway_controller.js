const model = require('../models/index')
const helpers = require('../helpers/helper')
require('express-async-errors')

module.exports.getAllTerminalPaymentGateway = async (req, res, next) => {
  if (req.query.terminalId.toLowerCase() === 'all') {
    helpers.customGetAllTerminalPaymentGateway(req.setting)
  }
  var data = await model.terminal_payment_gateway.findAndCountAll(req.setting)
  data['rows'].sort(helpers.sortingTerminalPaymentGateway)
  if (!data) throw Error(helpers.asyncErrorMessage('get'))
  res.status(200).json(helpers.OutputSuccess(
    data, 'get', helpers.generateMetaPage(req.meta, data, req.limit)
  ))
}

module.exports.getSingleTerminalPaymentGateway = async (req, res, next) => {
  const data = await model.terminal_payment_gateway.findOne(req.setting)
  if (!data) throw Error(helpers.asyncErrorMessage('get'))
  res.status(200).json(helpers.OutputSuccess(data))
}

module.exports.createTerminalPaymentGateway = async (req, res, next) => {
  const data = await model.terminal_payment_gateway.create(req.body)
  if (!data) throw Error(helpers.asyncErrorMessage('create'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'post'))
}

module.exports.updateTerminalPaymentGateway = async (req, res, next) => {
  const data = await model.terminal_payment_gateway.update(req.body, {
    where: helpers.generateCondition('id', req.params.id)
  })
  if (!data) throw Error(helpers.asyncErrorMessage('update'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'update'))
}

module.exports.deleteTerminalPaymentGateway = async (req, res, next) => {
  const data = await model.terminal_payment_gateway.destroy({
    where: helpers.generateCondition('id', req.params.id)
  })
  if (!data) throw Error(helpers.asyncErrorMessage('delete'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'delete'))
}
