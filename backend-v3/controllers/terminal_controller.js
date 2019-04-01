const model = require('../models/index')
const helpers = require('../helpers/helper')
require('express-async-errors')

module.exports.getAllTerminal = async (req, res, next) => {
  var data = await model.terminal.findAndCountAll(req.setting)
  if (!data) throw Error(helpers.asyncErrorMessage('get'))
  res.status(200).json(helpers.OutputSuccess(
    data, 'get', helpers.generateMetaPage(req.meta, data, req.limit)
  ))
}

module.exports.getSingleTerminal = async (req, res, next) => {
  const data = await model.terminal.findOne(req.setting)
  if (!data) throw Error(helpers.asyncErrorMessage('get'))
  res.status(200).json(helpers.OutputSuccess(data))
}

module.exports.createTerminal = async (req, res, next) => {
  await helpers.createUser(req.body, 2)
  const data = await model.terminal.create(req.body)
  if (!data) throw Error(helpers.asyncErrorMessage('create'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'post'))
}

module.exports.updateTerminal = async (req, res, next) => {
  var terminal = await helpers.getSingleData('terminal', req.params.id)
  const data = await model.terminal.update(req.body, {
    where: helpers.generateCondition('id', req.params.id)
  })
  await model.user.update(req.body, {
    where: helpers.generateCondition('id', terminal.userId)
  })
  if (!data) throw Error(helpers.asyncErrorMessage('update'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'update'))
}

module.exports.updateTerminalFcmToken = async (req, res, next) => {
  const data = await model.terminal.update(req.body, {
    where: helpers.generateCondition('id', req.body.terminalId)
  })
  if (!data) throw Error(helpers.asyncErrorMessage('update'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'update'))
}

module.exports.deleteTerminal = async (req, res, next) => {
  const terminal = await helpers.getSingleData('terminal', req.params.id)
  await model.user.destroy({
    where: helpers.generateCondition('id', terminal.userId)
  })
  const data = await model.terminal.destroy({
    where: helpers.generateCondition('id', req.params.id)
  })
  if (!data) throw Error(helpers.asyncErrorMessage('delete'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'delete'))
}

module.exports.changePassword = async (req, res, next) => {
  const data = await model.user.update(req.body, {
    where: helpers.generateCondition('id', req.userId)
  })
  if (!data) throw Error(helpers.asyncErrorMessage('update'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'update'))
}
