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
        bankAccountNumber: '029384982312350'
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
        bankAccountNumber: '012938019274128'
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
      },
      {
        id: 6,
        idAlias: '321-ABGH',
        name: 'Mika Dana Store',
        description: 'Mika Dana Store Dummy',
        companyForm: 'PT',
        email: 'mika.dana@mika.id',
        streetAddress: 'Jl. Jakarta 54',
        locality: 'Bandung',
        district: 'Bandung',
        city: 'Bandung',
        province: 'West Java',
        postalCode: '40286',
        phoneNumber: '021676976',
        logo: 'data:image/png;base64,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',
        taxCardNumber: '26293467293746239847623',
        bankName: 'BCA',
        bankBranchName: '',
        bankAccountName: 'BCA Account',
        bankAccountNumber: '782173801273'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('merchant', null, {})
  }
}
