'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('acquirer', [
      {
        id: 1,
        name: 'LinkAja Maju Tembak',
        gateway: false,
        hidden: false,
        minimumAmount: 100,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 1,
        acquirerConfigId: 1,
        merchantId: 1
      },
      {
        id: 2,
        name: 'Gopay Maju Tembak',
        gateway: false,
        hidden: false,
        minimumAmount: 1,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 2,
        acquirerConfigId: 2,
        merchantId: 1
      },
      {
        id: 3,
        name: 'Alipay Maju Tembak',
        gateway: false,
        hidden: false,
        minimumAmount: 1000,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 3,
        acquirerConfigId: 3,
        merchantId: 1
      },
      {
        id: 4,
        name: 'WeChat Pay Maju Tembak',
        gateway: false,
        hidden: false,
        minimumAmount: 1000,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 4,
        acquirerConfigId: 3,
        merchantId: 1
      },
      {
        id: 5,
        name: 'Kartu Debit Maju Tembak',
        gateway: false,
        hidden: false,
        shareAcquirer: 0.02,
        shareMerchant: 0.9800,
        minimumAmount: 25000,
        acquirerTypeId: 5,
        acquirerConfigId: 10,
        merchantId: 1
      },
      {
        id: 6,
        name: 'Kartu Kredit Maju Tembak',
        gateway: false,
        hidden: false,
        shareAcquirer: 0.02,
        shareMerchant: 0.9800,
        minimumAmount: 25000,
        acquirerTypeId: 6,
        acquirerConfigId: 10,
        merchantId: 1
      },

      {
        id: 11,
        name: 'LinkAja Super Moe',
        gateway: false,
        hidden: false,
        minimumAmount: 100,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 1,
        acquirerConfigId: 1,
        merchantId: 2
      },
      {
        id: 12,
        name: 'Gopay Super Moe',
        gateway: false,
        hidden: false,
        minimumAmount: 1,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 2,
        acquirerConfigId: 2,
        merchantId: 2
      },
      {
        id: 13,
        name: 'Alipay Super Moe',
        gateway: false,
        hidden: false,
        minimumAmount: 1000,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 3,
        acquirerConfigId: 3,
        merchantId: 2
      },
      {
        id: 14,
        name: 'WeChat Pay Super Moe',
        gateway: false,
        hidden: false,
        minimumAmount: 1000,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 4,
        acquirerConfigId: 3,
        merchantId: 2
      },

      {
        id: 21,
        name: 'LinkAja Anak Asing',
        gateway: false,
        hidden: false,
        minimumAmount: 100,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 1,
        acquirerConfigId: 1,
        merchantId: 3
      },
      {
        id: 22,
        name: 'Gopay Anak Asing',
        gateway: false,
        hidden: false,
        minimumAmount: 1,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 2,
        acquirerConfigId: 2,
        merchantId: 3
      },
      {
        id: 23,
        name: 'Alipay Anak Asing',
        gateway: false,
        hidden: false,
        minimumAmount: 1000,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 3,
        acquirerConfigId: 3,
        merchantId: 3
      },
      {
        id: 24,
        name: 'WeChat Pay Anak Asing',
        gateway: false,
        hidden: false,
        minimumAmount: 1000,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 4,
        acquirerConfigId: 3,
        merchantId: 3
      },

      {
        id: 31,
        name: 'LinkAja Sayur Jayagiri',
        gateway: false,
        hidden: false,
        minimumAmount: 100,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 1,
        acquirerConfigId: 1,
        merchantId: 4
      },
      {
        id: 32,
        name: 'Gopay Sayur Jayagiri',
        gateway: false,
        hidden: false,
        minimumAmount: 1,
        shareAcquirer: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        acquirerTypeId: 2,
        acquirerConfigId: 2,
        merchantId: 4
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('acquirer', null, {})
  }
}
