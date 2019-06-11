'use strict'

const bcrypt = require('bcrypt')

module.exports = async (req, res) => {
  let param = {
    input: 'this is a test string',
    saltCount: 10
  }
  if (req.body) {
    param.input = req.body.input || param.input
    param.saltCount = parseInt(req.body.saltCount) || param.saltCount
  }
  res.status(200).send({
    hash: await bcrypt.hash(param.input, param.saltCount),
    saltCount: param.saltCount
  })
}
