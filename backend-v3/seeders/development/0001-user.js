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
      },
      {
        id: 31,
        secure: false,
        username: 'agent11',
        password: await hash.bcryptHash('agent11'),
        userType: 'agent'
      },
      {
        id: 32,
        secure: false,
        username: 'agent12',
        password: await hash.bcryptHash('agent12'),
        userType: 'agent'
      },
      {
        id: 33,
        secure: false,
        username: 'agent13',
        password: await hash.bcryptHash('agent13'),
        userType: 'agent'
      },
      {
        id: 34,
        secure: false,
        username: 'agent14',
        password: await hash.bcryptHash('agent14'),
        userType: 'agent'
      },

      {
        id: 91,
        secure: false,
        username: 'mika',
        password: await hash.bcryptHash('mika'),
        userType: 'agent'
      },
      {
        id: 92,
        secure: false,
        username: 'mika2',
        password: await hash.bcryptHash('mika2'),
        userType: 'agent'
      },
      {
        id: 93,
        secure: false,
        username: 'mika3',
        password: await hash.bcryptHash('mika3'),
        userType: 'agent'
      },
      {
        id: 94,
        secure: false,
        username: 'mika4',
        password: await hash.bcryptHash('mika4'),
        userType: 'agent'
      },
      {
        id: 95,
        secure: false,
        username: 'mika5',
        password: await hash.bcryptHash('mika5'),
        userType: 'agent'
      },
      {
        id: 96,
        secure: false,
        username: 'mika6',
        password: await hash.bcryptHash('mika6'),
        userType: 'agent'
      },
      {
        id: 101,
        secure: false,
        username: 'mikastaff',
        password: await hash.bcryptHash('mikastaff'),
        userType: 'merchantStaff'
      },
      {
        id: 102,
        secure: false,
        username: 'mikastaff2',
        password: await hash.bcryptHash('mikastaff2'),
        userType: 'merchantStaff'
      },
      {
        id: 103,
        secure: false,
        username: 'mikastaff3',
        password: await hash.bcryptHash('mikastaff3'),
        userType: 'merchantStaff'
      },
      {
        id: 104,
        secure: false,
        username: 'mikastaff4',
        password: await hash.bcryptHash('mikastaff4'),
        userType: 'merchantStaff'
      },

      {
        id: 201,
        secure: false,
        username: 'acquirerStaff',
        password: await hash.bcryptHash('acquirerStaff'),
        userType: 'acquirerStaff'
      },
      {
        id: 202,
        secure: false,
        username: 'acquirerStaff2',
        password: await hash.bcryptHash('acquirerStaff2'),
        userType: 'acquirerStaff'
      },
      {
        id: 203,
        secure: false,
        username: 'acquirerStaff3',
        password: await hash.bcryptHash('acquirerStaff3'),
        userType: 'acquirerStaff'
      },
      {
        id: 204,
        secure: false,
        username: 'acquirerStaff4',
        password: await hash.bcryptHash('acquirerStaff4'),
        userType: 'acquirerStaff'
      }

    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('user', null, {})
  }
}
