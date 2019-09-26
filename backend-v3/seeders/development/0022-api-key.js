'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('apiKey', [
      {
        id: 1,
        idKey: '46bf52d18be7',
        secretKey: '9cd2c75f22c1fc1b3c79d21517134bbbf9c3eeb92f267a866f48092e8b7335d0', // 07mL9UiXCkiUEDSb
        sharedKey: 'URZ0W35s+I0XucK3',
        partnerId: 1
      }
    ]
    , {})
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('apiKey', null, {})
  }
}
