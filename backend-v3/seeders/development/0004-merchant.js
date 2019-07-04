'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('merchant', [
      {
        id: 1,
        idAlias: '312-AF4R',
        name: 'CV Maju Tembak',
        shortName: 'majutembak',
        companyForm: 'CV',
        email: 'merchant@example.com',
        bankName: 'Bank Central Asia',
        bankBranchName: 'BCA Cihampelas',
        bankAccountName: 'John Wick',
        bankAccountNumber: '029384982312341'
      },

      {
        id: 2,
        idAlias: '312-PO34',
        name: 'PT Aggregasi Super Moe',
        shortName: 'agromesupermoe',
        companyForm: 'PT',
        email: 'merchant@example.org',
        bankName: 'Bank Mandiri',
        bankBranchName: 'Mandiri Menteng',
        bankAccountName: 'Barack Obama',
        bankAccountNumber: '123981029380309'
      },

      {
        id: 3,
        idAlias: '321-A234',
        name: 'Koperasi Karya Anak Asing',
        shortName: 'koaasing',
        companyForm: 'Koperasi',
        email: 'merchant_partner@example.org',
        bankName: 'Bank Rakyat Indonesia',
        bankBranchName: 'BRI Cisewu',
        bankAccountName: 'Rewu Satria',
        bankAccountNumber: '029384982312350',
        partnerId: 1
      },

      {
        id: 4,
        idAlias: '321-F892',
        name: 'Persatuan Tukang Sayur Jayagiri',
        shortName: 'SAYURJAYAG',
        companyForm: '',
        email: 'merchant_partner2@example.org',
        bankName: 'Bank Rakyat Indonesia',
        bankBranchName: 'Bank Rakyat Indonesia Jayagiri',
        bankAccountName: 'Abang Kuat',
        bankAccountNumber: '012938019274128',
        partnerId: 1
      },

      {
        id: 5,
        idAlias: '321-ABFD',
        name: 'Mika Store',
        shortName: 'mika',
        companyForm: 'PT',
        email: 'mika@getmika.id',
        bankName: 'Bank Cabang Asia',
        bankBranchName: 'Bank Cabang Asia Menteng',
        bankAccountName: 'Mika Person',
        bankAccountNumber: '028123901291287'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('merchant', null, {})
  }
}
