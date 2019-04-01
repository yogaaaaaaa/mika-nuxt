'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('paymentProviderType', [
      {
        id: 1,
        class: 'linkaja',
        name: 'LinkAja',
        thumbnail: 'linkaja.png',
        thumbnailGray: 'linkaja-gray.png',
        chartColor: '#EE1B1F'
      },
      {
        id: 2,
        class: 'gopay',
        name: 'GO-PAY',
        thumbnail: 'gopay.png',
        thumbnailGray: 'gopay-gray.png',
        chartColor: '#5DA4DA'
      },
      {
        id: 3,
        class: 'wechatpay',
        name: 'WeChat Pay',
        thumbnail: 'wechat-pay.png',
        thumbnailGray: 'wechat-pay-gray.png',
        chartColor: '#2CC200'
      },
      {
        id: 4,
        class: 'alipay',
        name: 'AliPay',
        thumbnail: 'alipay.png',
        thumbnailGray: 'alipay-gray.png',
        chartColor: '#01AAEE'
      },
      {
        id: 5,
        class: 'emvCredit',
        name: 'Kartu Kredit',
        thumbnail: 'card-credit.png',
        thumbnailGray: 'card-credit-gray.png',
        chartColor: '#192061'
      },
      {
        id: 6,
        class: 'emvDebit',
        name: 'Kartu Debit',
        thumbnail: 'card.png',
        thumbnailGray: 'card-debit-gray.png',
        chartColor: '#4A90D9'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('paymentProviderType', null, {})
  }
}
