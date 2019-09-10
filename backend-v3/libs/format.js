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

module.exports.formatCurrencyIDR = (value) =>
  exports.accounting.formatMoney(value || 0, 'Rp ', 2, '.', ',')
