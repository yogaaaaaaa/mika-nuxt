'use strict'

/**
 * Note: all password is the same as username
 */

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('user', [
      {
        id: 1,
        secure: false,
        username: 'admin',
        password: '$2a$10$I0VTxW1XMXkL8uvzrK7Emex/z53RQdXlxubUMrgP1PxDH4CMkZgZa',
        userType: 'admin',
        userRoles: 'adminHead,adminFinance,adminMarketing,adminSupport,adminLogistic'
      },
      {
        id: 2,
        secure: false,
        username: 'admin2',
        password: '$2a$10$QkbojWRg5IKnF0gK3e4CTud.pc.1lP5G1SBBxhPLATZxRZYiNGv2K',
        userType: 'admin',
        userRoles: 'adminHead,adminFinance'
      },
      {
        id: 3,
        secure: false,
        username: 'admin3',
        password: '$2a$10$As2NOwEj3.0cZR0CQ2u6BewGuyYpyuU2yG61kcHVFNJ8uguBGEvq6',
        userType: 'admin',
        userRoles: 'adminFinance'
      },
      {
        id: 4,
        secure: false,
        username: 'merchantStaff',
        password: '$2a$10$km.1Uc4SADcFkbWTpA9IYu8mVwDvBknl7.4qFf2aSurn9P7ptnc4C',
        userType: 'merchantStaff'
      },
      {
        id: 5,
        secure: false,
        username: 'merchantStaff2',
        password: '$2a$10$9OQ6.wN8j/jyrrXLENEh7OWf4qly.Wai3q5tlHKsVYGRRQwqxhD6W',
        userType: 'merchantStaff'
      },
      {
        id: 6,
        secure: false,
        username: 'merchantStaff3',
        password: '$2a$10$ro1HEPfG/bCmkG/DYU3I5uh2KnNGsB0p6qC/wJFB9VCMVPwDttpwW',
        userType: 'merchantStaff'
      },
      {
        id: 7,
        secure: true,
        username: 'agent',
        password: '$2a$10$BVGsnmCBVa9k5JuDWgarWu43M95H.bnEaHu6fnburECV1I4dX0D/6',
        userType: 'agent'
      },
      {
        id: 8,
        secure: false,
        username: 'agent2',
        password: '$2a$10$QOGhZdp1U3VFZE6kacM5ku6jxmpW82XOKuEFPoeDdvaTqyP2wDIn2',
        userType: 'agent'
      },
      {
        id: 9,
        secure: false,
        username: 'agent3',
        password: '$2a$10$dwTTfvfPQdABNOW22rIkY.ZZeYR23ZzEl0KsQ2bz88gOHtU70.svu',
        userType: 'agent'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('user', null, {})
  }
}
