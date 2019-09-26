'use strict'

module.exports.genericErrorTypes = require('./constants/genericErrorTypes')

module.exports.createError = (name, message, data) => {
  const error = Error(message)
  error.name = name
  error.data = data
  return error
}

module.exports.isError = (err, name) => {
  if (err.name && err.name === name) return true
}
