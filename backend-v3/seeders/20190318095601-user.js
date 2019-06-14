'use strict'

const hash = require('../libs/hash')

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
        password: await hash.bcryptHash('admin'),
        userType: 'admin',
        userRoles: 'adminHead,adminFinance,adminMarketing,adminSupport,adminLogistic'
      },
      {
        id: 2,
        secure: false,
        username: 'admin2',
        password: await hash.bcryptHash('admin2'),
        userType: 'admin',
        userRoles: 'adminHead,adminFinance,adminMarketing,adminSupport,adminLogistic'
      },
      {
        id: 3,
        secure: false,
        username: 'admin3',
        password: await hash.bcryptHash('admin3'),
        userType: 'admin',
        userRoles: 'adminFinance'
      },
      {
        id: 4,
        secure: false,
        username: 'admin4',
        password: await hash.bcryptHash('admin4'),
        userType: 'admin',
        userRoles: 'adminMarketing'
      },
      {
        id: 5,
        secure: false,
        username: 'admin5',
        password: await hash.bcryptHash('admin5'),
        userType: 'admin',
        userRoles: 'adminSupport'
      },
      {
        id: 6,
        secure: false,
        username: 'admin6',
        password: await hash.bcryptHash('admin6'),
        userType: 'admin',
        userRoles: 'adminLogistic'
      },

      {
        id: 11,
        secure: false,
        username: 'merchantStaff',
        password: await hash.bcryptHash('merchantStaff'),
        userType: 'merchantStaff'
      },
      {
        id: 12,
        secure: false,
        username: 'merchantStaff2',
        password: await hash.bcryptHash('merchantStaff2'),
        userType: 'merchantStaff'
      },
      {
        id: 13,
        secure: false,
        username: 'merchantStaff3',
        password: await hash.bcryptHash('merchantStaff3'),
        userType: 'merchantStaff'
      },
      {
        id: 14,
        secure: false,
        username: 'merchantStaff4',
        password: await hash.bcryptHash('merchantStaff4'),
        userType: 'merchantStaff'
      },
      {
        id: 15,
        secure: false,
        username: 'merchantStaff5',
        password: await hash.bcryptHash('merchantStaff5'),
        userType: 'merchantStaff'
      },

      {
        id: 21,
        secure: true,
        username: 'agent',
        password: await hash.bcryptHash('agent'),
        userType: 'agent'
      },
      {
        id: 22,
        secure: false,
        username: 'agent2',
        password: await hash.bcryptHash('agent2'),
        userType: 'agent'
      },
      {
        id: 23,
        secure: false,
        username: 'agent3',
        password: await hash.bcryptHash('agent3'),
        userType: 'agent'
      },
      {
        id: 24,
        secure: false,
        username: 'agent4',
        password: await hash.bcryptHash('agent4'),
        userType: 'agent'
      },
      {
        id: 25,
        secure: false,
        username: 'agent5',
        password: await hash.bcryptHash('agent5'),
        userType: 'agent'
      },
      {
        id: 26,
        secure: false,
        username: 'agent6',
        password: await hash.bcryptHash('agent6'),
        userType: 'agent'
      },
      {
        id: 27,
        secure: false,
        username: 'agent7',
        password: await hash.bcryptHash('agent7'),
        userType: 'agent'
      },
      {
        id: 28,
        secure: false,
        username: 'agent8',
        password: await hash.bcryptHash('agent8'),
        userType: 'agent'
      },
      {
        id: 29,
        secure: false,
        username: 'agent9',
        password: await hash.bcryptHash('agent9'),
        userType: 'agent'
      },
      {
        id: 30,
        secure: false,
        username: 'agent10',
        password: await hash.bcryptHash('agent10'),
        userType: 'agent'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('user', null, {})
  }
}
