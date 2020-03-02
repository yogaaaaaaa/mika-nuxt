'use strict'

const tamper = require('tamper')

module.exports.attach = ({ log = console.log } = {}) => {
  log('auditLog attached')
  return tamper((req, res) => {
    /** disable tamper for a while */
    // const contentType = (res.getHeader('content-type').split(';'))[0].toLowerCase()
    // if (['application/json'].includes(contentType)) {
    //   return async (body) => {
    //     return body
    //   }
    // }
  })
}
