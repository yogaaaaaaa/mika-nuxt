'use strict'

const extApiAuth = require('../libs/extApiAuth')

module.exports.extApiAuth = async (req, res, next) => {
  req.auth = null
  try {
    if (req.headers['authorization']) {
      let authComponent = req.headers['authorization'].split(' ')
      if (authComponent[0].toLowerCase() === 'bearer') {
        req.auth = await extApiAuth.verifyClientToken(authComponent[1])
      }
    }
  } catch (err) {
    console.error(err)
  }
  next()
}
