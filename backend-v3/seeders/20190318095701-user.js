'use strict'

/**
 * Note: all password is the same as username
 */

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('user', [
      {
        id: 1,
        username: 'admin',
        password: '$2a$10$p45Iaqx7/c47QniKpldt2.knlAM2qVcn017/XeBGcyJZP76nFFVhS',
        userType: 'admin'
      },
      {
        id: 2,
        username: 'merchant',
        password: '$2a$10$RJohqtXu0m7.5bU92zU/QeYPoPT/dshRUjqNxgLGGftkE0JZJSWHq',
        userType: 'merchant'
      },
      {
        id: 3,
        username: 'merchant2',
        password: '$2a$10$UqoIM7gNtyyCmVrnCBuvveFMrDDQgkOxlzVi3qb7fg8WvfGS/1MTm',
        userType: 'merchant'
      },
      {
        id: 4,
        username: 'agent',
        password: '$2a$10$wPw4wqSqRndTxohXA4aum.IP6b/u7wHO3h5GKt62PPA.K81GDCOzC',
        userType: 'agent'
      },
      {
        id: 5,
        username: 'agent2',
        password: '$2a$10$HiofLhl3.A8Rjdc4ZGUqRuIY.W9U6hntF7LboiUOAZQO823ap6Ku2',
        userType: 'agent'
      },
      {
        id: 6,
        username: 'agent3',
        password: '2a$10$vV96Nwx2YtASyPeXcvPJJexfMEvtde1mZJ95wD1WYJ3Fzb9McS6nW',
        userType: 'agent'
      },
      {
        id: 7,
        username: 'merchantPic',
        password: '$2a$10$l/.OFQgLMEJrqa1qwYYsj.PFmr5BxJj4nfyOCemzKJVOCN6uTIU6i',
        userType: 'merchantPic'
      },
      {
        id: 8,
        username: 'merchantPic2',
        password: '$2a$10$hPB0LV5giK/taEoDUZjNze1a4g.h4rX0Qavuh0MCh6Ix3WIMCrDUa',
        userType: 'merchantPic'
      },
      {
        id: 9,
        username: 'merchantPi3',
        password: '$2a$10$epo0TSpv6OHZBPOdjffu/OuK8ddDGC8/LjIgSpHP8iFNQ2rG9C8W6',
        userType: 'merchantPic'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('user', null, {})
  }
}
