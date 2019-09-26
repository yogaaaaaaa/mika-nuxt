'use strict'

const Moment = require('moment')
const momentRange = require('moment-range')

const moment = momentRange.extendMoment(Moment)

module.exports.isUtcOffset = (utcOffset) => {
  if (utcOffset.match(/[+-][0-2]\d:?[0-5]\d/)) return true
}

module.exports.utcOffsetToMinutes = (utcOffset) => {
  const offsetComponents = utcOffset.match(/([+-])([0-2]\d):?([0-5]\d)/)
  if (offsetComponents) {
    return (parseInt(`${offsetComponents[1]}1`)) * (parseInt(offsetComponents[2]) * 60) + parseInt(offsetComponents[3])
  }
}

module.exports.moment = moment
