'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('paymentProvider', [
      {
        id: 1,
        name: 'LinkAja Maju Tembak',
        minimumAmount: 100,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 1,
        paymentProviderConfigId: 1,
        merchantId: 1
      },
      {
        id: 2,
        name: 'Gopay Maju Tembak',
        minimumAmount: 1,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 2,
        paymentProviderConfigId: 2,
        merchantId: 1
      },
      {
        id: 3,
        name: 'Alipay Maju Tembak',
        minimumAmount: 1000,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 3,
        paymentProviderConfigId: 3,
        merchantId: 1
      },
      {
        id: 4,
        name: 'WeChat Pay Maju Tembak',
        minimumAmount: 1000,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 4,
        paymentProviderConfigId: 3,
        merchantId: 1
      },

      {
        id: 5,
        name: 'LinkAja Super Moe',
        minimumAmount: 100,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 1,
        paymentProviderConfigId: 1,
        merchantId: 2
      },
      {
        id: 6,
        name: 'Gopay Super Moe',
        minimumAmount: 1,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 2,
        paymentProviderConfigId: 2,
        merchantId: 2
      },
      {
        id: 7,
        name: 'Alipay Super Moe',
        minimumAmount: 1000,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 3,
        paymentProviderConfigId: 3,
        merchantId: 2
      },
      {
        id: 8,
        name: 'WeChat Pay Super Moe',
        minimumAmount: 1000,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 4,
        paymentProviderConfigId: 3,
        merchantId: 2
      },

      {
        name: 'LinkAja Anak Asing',
        minimumAmount: 100,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 1,
        paymentProviderConfigId: 1,
        merchantId: 3
      },
      {
        name: 'Gopay Anak Asing',
        minimumAmount: 1,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 2,
        paymentProviderConfigId: 2,
        merchantId: 3
      },
      {
        name: 'Alipay Anak Asing',
        minimumAmount: 1000,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 3,
        paymentProviderConfigId: 3,
        merchantId: 3
      },
      {
        name: 'WeChat Pay Anak Asing',
        minimumAmount: 1000,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 4,
        paymentProviderConfigId: 3,
        merchantId: 3
      },

      {
        name: 'LinkAja Sayur Jayagiri',
        minimumAmount: 100,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 1,
        paymentProviderConfigId: 1,
        merchantId: 3
      },
      {
        name: 'Gopay Sayur Jayagiri',
        minimumAmount: 1,
        sharePaymentProvider: 0.01,
        shareMerchant: 0.9800,
        shareMerchantWithPartner: 0.9700,
        sharePartner: 0.01,
        paymentProviderTypeId: 2,
        paymentProviderConfigId: 2,
        merchantId: 3
      },

      {
        name: 'Kartu Debit Maju Tembak',
        gateway: true,
        paymentProviderTypeId: 5,
        merchantId: 1
      },
      {
        name: 'Kartu Kredit Maju Tembak',
        gateway: true,
        paymentProviderTypeId: 6,
        merchantId: 1
      },
      {
        name: 'BRI Debit On-Us Maju Tembak',
        hidden: true,
        minimumAmount: 25000,
        paymentProviderTypeId: 5,
        merchantId: 1
      },
      {
        name: 'BRI Kredit On-Us Maju Tembak',
        hidden: true,
        minimumAmount: 25000,
        paymentProviderTypeId: 6,
        merchantId: 1
      },
      {
        name: 'BRI Debit Off-Us Maju Tembak',
        hidden: true,
        minimumAmount: 25000,
        paymentProviderTypeId: 5,
        merchantId: 1
      },
      {
        name: 'BRI Kredit Off-Us Maju Tembak',
        hidden: true,
        minimumAmount: 25000,
        paymentProviderTypeId: 6,
        merchantId: 1
      },
      {
        name: 'BNI Debit On-us Maju Tembak',
        hidden: true,
        minimumAmount: 25000,
        paymentProviderTypeId: 5,
        merchantId: 1
      },
      {
        name: 'BNI Kredit On-us Maju Tembak',
        hidden: true,
        minimumAmount: 25000,
        paymentProviderTypeId: 6,
        merchantId: 1
      },
      {
        name: 'BNI Debit Off-us Maju Tembak',
        hidden: true,
        minimumAmount: 25000,
        paymentProviderTypeId: 5,
        merchantId: 1
      },
      {
        name: 'BNI Kredit Off-us Maju Tembak',
        hidden: true,
        minimumAmount: 25000,
        paymentProviderTypeId: 6,
        merchantId: 1
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('paymentProvider', null, {})
  }
}
