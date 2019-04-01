'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('apiKey', [
      {
        id: 1,
        apiIdKey: '46bf52d18be7',
        apiSecretKey: '9cd2c75f22c1fc1b3c79d21517134bbbf9c3eeb92f267a866f48092e8b7335d0', // 07mL9UiXCkiUEDSb
        apiSharedKey: 'URZ0W35s+I0XucK3',
        partnerId: 1
      },
      {
        id: 2,
        apiIdKey: 'd16e8865b3c1',
        apiSecretKey: '4cd3dab3007383f120e3f5c75d6e5abdcd2ddcc750baff8ed68436d3be7a8a32', // sm1T3bbeUSz+zGVo
        apiSharedKey: 'F5ZGwhnCPlqOBL4x',
        partnerId: null
      }
    ]
    , {})
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('apiKey', null, {})
  }
}
