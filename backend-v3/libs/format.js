'use strict'

const currency = require('currency.js')
const numeral = require('numeral')

module.exports.createCurrencyIDR = (value) => {
  return currency(value || '0', {
    formatWithSymbol: true,
    symbol: 'Rp ',
    decimal: ',',
    separator: '.'
  })
}

module.exports.numeral = numeral
module.exports.currency = currency
