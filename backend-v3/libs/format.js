'use strict'

module.exports.accounting = require('accounting')

module.exports.decimalAmountPadded = (amount, length = 12) => {
  amount = String(amount || 0)
  amount = amount.split('.')

  const amountIntegerPart = amount[0]
  let amountFractionalPart = amount[1] || '00'

  if (amountFractionalPart.length > 2) {
    amountFractionalPart = amountFractionalPart.slice(0, 2)
  }

  return `${amountIntegerPart}${amountFractionalPart}`.padStart(length, '0')
}

module.exports.decimalAmountPaddedParse = (amount) => {
  amount = String(amount || 0)

  // ex: 10060 -> should be 100.6

  const amountIntegerPart = amount.substring(0, amount.length - 2)
  const fractionalPart = amount.slice(-2)

  return `${amountIntegerPart}.${fractionalPart}`
}

module.exports.formatCurrencyIDR = (value) =>
  exports.accounting.formatMoney(value || 0, 'Rp ', 2, '.', ',')
