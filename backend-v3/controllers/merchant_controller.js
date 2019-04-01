const model = require('../models/index')
const helpers = require('../helpers/helper')
require('express-async-errors')

module.exports.getAllMerchant = async (req, res, next) => {
  var data = await model.merchant.findAndCountAll(req.setting)
  if (!data) throw Error(helpers.asyncErrorMessage('get'))
  res.status(200).json(helpers.OutputSuccess(
    data, 'get', helpers.generateMetaPage(req.meta, data, req.limit)
  ))
}

module.exports.getSingleMerchant = async (req, res, next) => {
  const data = await model.merchant.findOne(req.setting)
  if (!data) throw Error(helpers.asyncErrorMessage('get'))
  res.status(200).json(helpers.OutputSuccess(data))
}

module.exports.myTerminal = async (req, res, next) => {
  const data = await model.terminal.findAndCountAll(req.setting)
  if (!data) throw Error(helpers.asyncErrorMessage('get'))
  res.status(200).json(helpers.OutputSuccess(data))
}

module.exports.createMerchant = async (req, res, next) => {
  await helpers.createUser(req.body, 3)
  const data = await model.merchant.create(req.body)
  if (!data) throw Error(helpers.asyncErrorMessage('create'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'post'))
}

module.exports.updateMerchant = async (req, res, next) => {
  var merchant = await helpers.getSingleData('merchant', req.params.id)
  const data = await model.merchant.update(req.body, {
    where: helpers.generateCondition('id', req.params.id)
  })
  await model.user.update(req.body, {
    where: helpers.generateCondition('id', merchant.userId)
  })
  if (!data) throw Error(helpers.asyncErrorMessage('update'))
  res.status(200).json(helpers.OutputSuccess(req.body, 'update'))
}

module.exports.deleteMerchant = async (req, res, next) => {
  const merchant = await helpers.getSingleData('merchant', req.params.id)
  await model.user.destroy({
    where: helpers.generateCondition('id', merchant.userId)
  })
  const data = await model.merchant.destroy({
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
