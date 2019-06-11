'use strict'

const crypto = require('crypto')

const hashTypes = ['sha1', 'sha256', 'sha512', 'sha3-224', 'sha3-256', 'sha3-512']

module.exports = (req, res) => {
  let param = {
    input: 'this is a test string',
    type: 'sha256'
  }

  if (req.body) {
    param.input = req.body.input || param.input
    param.type = hashTypes.includes(req.body.type) ? req.body.type : param.type
  }

  res.status(200).send({
    hash: crypto.createHash(param.type).update(param.input).digest('hex'),
    type: param.type
  })
}
