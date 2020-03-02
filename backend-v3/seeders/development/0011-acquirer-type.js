'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('acquirerType', [
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
        thumbnail: 'wechatpay.png',
        thumbnailGray: 'wechatpay-gray.png',
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
        class: 'cardDebit',
        name: 'Kartu Debit',
        thumbnail: 'card.png',
        thumbnailGray: 'card-gray.png',
        chartColor: '#4A90D9'
      },
      {
        id: 6,
        class: 'cardCredit',
        name: 'Kartu Kredit',
        thumbnail: 'card.png',
        thumbnailGray: 'card-gray.png',
        chartColor: '#192061'
      },
      {
        id: 7,
        class: 'qris',
        name: 'QR Nasional (QRIS)',
        thumbnail: 'bi.png',
        thumbnailGray: 'bi-gray.png',
        chartColor: '#0A4678'
      },
      {
        id: 8,
        class: 'cardPrepaid',
        name: 'Kartu Prepaid',
        thumbnail: 'card.png',
        thumbnailGray: 'card-gray.png',
        chartColor: '#0A4678'
      },
      {
        id: 50,
        class: 'cardSwitcher',
        name: 'Pembayaran Kartu',
        thumbnail: 'card.png',
        thumbnailGray: 'card-gray.png',
        chartColor: null
      },
      {
        id: 100,
        class: 'kumapay',
        name: 'Kuma Pay',
        thumbnail: 'kumapay.png',
        thumbnailGray: 'kumapay-gray.png',
        chartColor: '#808080'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('acquirerType', null, {})
  }
}
