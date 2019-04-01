'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('merchant', [
      {
        id: 1,
        name: 'CV Maju Tembak',
        companyForm: 'CV',
        email: 'merchant@example.com',
        bankName: 'Bank Central Asia',
        bankBranchName: 'BCA Cihampelas',
        bankAccountName: 'John Wick',
        bankAccountNumber: '029384982312341',
        userId: 2
      },
      {
        id: 2,
        name: 'PT Aggregasi Super Moe',
        companyForm: 'PT',
        email: 'merchant@example.org',
        bankName: 'Bank Mandiri',
        bankBranchName: 'Mandiri Menteng',
        bankAccountName: 'Barack Obama',
        bankAccountNumber: '123981029380309',
        userId: 3
      },
      {
        id: 3,
        name: 'Koperasi Karya Anak Asing',
        companyForm: 'Koperasi',
        email: 'merchant_partner@example.org',
        bankName: 'Bank Rakyat Indonesia',
        bankBranchName: 'BRI Cisewu',
        bankAccountName: 'Rewu Satria',
        bankAccountNumber: '029384982312350'
      },
      {
        id: 4,
        name: 'Persatuan Tukang Sayur Jayagiri',
        companyForm: '',
        email: 'merchant_partner2@example.org',
        bankName: 'Bank Rakyat Indonesia',
        bankBranchName: 'Bank Rakyat Indonesia Jayagiri',
        bankAccountName: 'Abang Kuat',
        bankAccountNumber: '012938019274128'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('merchant', null, {})
  }
}
