'use strict'

const hash = require('../libs/hash')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.bulkInsert('user', [
        {
          id: 1000,
          username: 'boby',
          password: await hash.bcryptHash('boby123'),
          userType: 'agent'
        }
      ], { transaction: t })

      await queryInterface.bulkInsert('merchant', [
        {
          id: 1000,
          idAlias: '312-AF54',
          name: 'Partner Merchant',
          shortName: 'partnermerch',
          companyForm: 'test',
          email: 'merchant@example.com',
          bankName: 'Bank Central Asia',
          bankBranchName: 'BCA Cihampelas',
          bankAccountName: 'Test Name',
          bankAccountNumber: '029384982312341'
        }
      ], { transaction: t })

      await queryInterface.bulkInsert('outlet', [
        {
          id: 1000,
          name: 'Outlet Partner Test',
          streetAddress: 'Jalan Rumah Kilo Testing Nomor 1293',
          phoneNumber: '0213182938',
          merchantId: 1000
        }
      ], { transaction: t })

      await queryInterface.bulkInsert('acquirer', [
        {
          id: 1001,
          name: 'LinkAja Partner Test',
          minimumAmount: 100,
          shareAcquirer: 0.01,
          shareMerchant: 0.9800,
          shareMerchantWithPartner: 0.9700,
          sharePartner: 0.01,
          acquirerTypeId: 1,
          acquirerConfigId: 1,
          merchantId: 1000
        },
        {
          id: 1002,
          name: 'Gopay Maju Partner Test',
          minimumAmount: 1,
          shareAcquirer: 0.01,
          shareMerchant: 0.9800,
          shareMerchantWithPartner: 0.9700,
          sharePartner: 0.01,
          acquirerTypeId: 2,
          acquirerConfigId: 2,
          merchantId: 1000
        },
        {
          id: 1003,
          name: 'Alipay Partner Test',
          minimumAmount: 1000,
          shareAcquirer: 0.01,
          shareMerchant: 0.9800,
          shareMerchantWithPartner: 0.9700,
          sharePartner: 0.01,
          acquirerTypeId: 3,
          acquirerConfigId: 3,
          merchantId: 1000
        },
        {
          id: 1004,
          name: 'WeChat Pay Partner Test',
          minimumAmount: 1000,
          shareAcquirer: 0.01,
          shareMerchant: 0.9800,
          shareMerchantWithPartner: 0.9700,
          sharePartner: 0.01,
          acquirerTypeId: 4,
          acquirerConfigId: 3,
          merchantId: 1000
        }
      ], { transaction: t })

      await queryInterface.bulkInsert('agent', [
        {
          id: 1000,
          name: 'Agent Partner Test',
          userId: 1000,
          merchantId: 1000,
          outletId: 1000
        }
      ], { transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
  }
}
