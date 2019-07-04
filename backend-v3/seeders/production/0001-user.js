'use strict'

const hash = require('../../libs/hash')

/**
 * Note: all password is the same as username
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.bulkInsert('user', [
      {
        id: 1,
        secure: false,
        username: 'admin',
        password: await hash.bcryptHash('Tirta330ml'),
        userType: 'admin',
        userRoles: 'adminHead,adminFinance,adminMarketing,adminSupport,adminLogistic'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('user', null, {})
  }
}
