'use strict'

module.exports.delay = (ms) => {
  return new Promise((resolve, reject) => setTimeout(() => resolve(), ms))
}
