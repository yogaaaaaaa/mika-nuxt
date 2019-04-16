'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('cipherboxKey', [
      {
        id: 1,
        idKey: 'a76cd4cbb7759b662373221153a304a4',
        keys: '{"id":"a76cd4cbb7759b662373221153a304a4","cbx":"cb3","key":"R4IDd1z8KlgZBKgvv/qeaZXrXFhb9GSX3VsoyxOzNuuZYKe4+piZhIE0oOveHYkuZFNu/ozEcgFFMKk/+Tpofw=="}',
        terminalId: 1
      },
      {
        id: 2,
        idKey: 'b49eee223addd8c267774c29f34ec4be',
        keys: '{"id":"b49eee223addd8c267774c29f34ec4be","cbx":"cb3","key":"wOfYDOtYoAZBbNHhDBbSvGLivBN8M4xLlPeMTqvLesUtmP/a2zgXMaiYrZsMy23EhQre9nJA3Id1fXXWuSjK7Q=="}',
        terminalId: 2
      },
      {
        id: 3,
        idKey: 'fc61587469e19dbe9cc0e1123c3d6ade',
        keys: '{"id":"fc61587469e19dbe9cc0e1123c3d6ade","cbx":"cb3","key":"5zj/twWrIWErzQUbNEcu7n4h+132/Fu0DbXCaMPHB5JJSWFrJeMjjyPBbQHnXk0douL/3vjZobrsrpyK78UvAA=="}',
        terminalId: 3
      }
    ]
    , {})
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('cipherboxKey', null, {})
  }
}
