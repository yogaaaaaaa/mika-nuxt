'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('paymentProvider', [
      {
        id: 1,
        name: 'LinkAja Default',
        minimumAmount: 100,
        shareMerchant: 0.9900,
        shareMerchantWithPartner: 0.9800,
        sharePartner: 0.01,
        paymentProviderTypeId: 1,
        paymentProviderConfigId: 1
      },
      {
        id: 2,
        name: 'Gopay Default',
        minimumAmount: 1,
        shareMerchant: 0.9900,
        shareMerchantWithPartner: 0.9800,
        sharePartner: 0.01,
        paymentProviderTypeId: 2,
        paymentProviderConfigId: 2
      },
      {
        id: 3,
        name: 'Alipay Default',
        minimumAmount: 1000,
        shareMerchant: 0.9900,
        shareMerchantWithPartner: 0.9800,
        sharePartner: 0.01,
        paymentProviderTypeId: 3,
        paymentProviderConfigId: 3
      },
      {
        id: 4,
        name: 'WeChat Pay Default',
        minimumAmount: 1000,
        shareMerchant: 0.9900,
        shareMerchantWithPartner: 0.9800,
        sharePartner: 0.01,
        paymentProviderTypeId: 4,
        paymentProviderConfigId: 3
      },
      {
        id: 5,
        name: 'EMV Debit Gateway',
        gateway: true,
        paymentProviderTypeId: 5,
        paymentProviderConfigId: 4
      },
      {
        id: 6,
        name: 'EMV Credit Gateway',
        gateway: true,
        paymentProviderTypeId: 5,
        paymentProviderConfigId: 4
      },
      {
        id: 7,
        name: 'EMV Default - BNI Debit',
        hidden: true,
        minimumAmount: 25000,
        shareMerchant: 0.9800,
        paymentProviderTypeId: 6,
        paymentProviderConfigId: 5
      },
      {
        id: 8,
        name: 'EMV Default - BNI Kredit',
        hidden: true,
        minimumAmount: 50000,
        shareMerchant: 0.9700,
        paymentProviderTypeId: 5,
        paymentProviderConfigId: 5
      },
      {
        id: 9,
        name: 'EMV Default - BRI Debit',
        hidden: true,
        minimumAmount: 15000,
        shareMerchant: 0.9900,
        sharePartner: 0.01,
        paymentProviderTypeId: 6,
        paymentProviderConfigId: 5
      },
      {
        id: 10,
        name: 'EMV Default - BNI Kredit',
        hidden: true,
        minimumAmount: 60000,
        shareMerchant: 0.9700,
        paymentProviderTypeId: 5,
        paymentProviderConfigId: 4
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('paymentProvider', null, {})
  }
}
