'use strict'

const constants = require('./constants')

module.exports.genericErrorTypes = constants.genericErrorTypes

/**
 * Create mika style error
 */
module.exports.createError = ({
  name,
  message = undefined,
  data = undefined
}) => {
  const error = Error(message)
  error.name = name
  error.data = data
  return error
}
