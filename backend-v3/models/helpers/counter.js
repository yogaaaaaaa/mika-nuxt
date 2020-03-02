'use strict'

module.exports.generateCounterFunction = ({ attribute, max = 999999, min = 1 }) => {
  return function () {
    this[attribute] = this[attribute] + 1
    if (this[attribute] < min || this[attribute] > max) this[attribute] = min
  }
}
