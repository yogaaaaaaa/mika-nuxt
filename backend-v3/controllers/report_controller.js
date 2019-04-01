const model = require('../models/index')
const Moment = require('moment')
const helpers = require('../helpers/helper')

module.exports.sendReport = async (req, res, next) => {
  res.status(200).send('Report Berhasil di Kirim ke Email')
}

module.exports.createChart = async (req, res, next) => {
  helpers.sendEmail()
  res.status(200).send('send Email')
}
