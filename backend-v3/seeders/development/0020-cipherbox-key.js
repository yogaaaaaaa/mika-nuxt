'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('cipherboxKey', [
      {
        id: '1Kvv6oK5MzD8FLchUTVmFM1HbNB',
        keys: '{"id":"1Kvv6oK5MzD8FLchUTVmFM1HbNB","cbk":"cb1","k":"R4IDd1z8KlgZBKgvv/qeaZXrXFhb9GSX3VsoyxOzNuuZYKe4+piZhIE0oOveHYkuZFNu/ozEcgFFMKk/+Tpofw=="}',
        status: 'activated',
        terminalId: 1
      },
      {
        id: '1Kvv8l0KxE6Yd1JribNWuow3XPM',
        keys: '{"id":"1Kvv8l0KxE6Yd1JribNWuow3XPM","cbk":"cb1","k":"wOfYDOtYoAZBbNHhDBbSvGLivBN8M4xLlPeMTqvLesUtmP/a2zgXMaiYrZsMy23EhQre9nJA3Id1fXXWuSjK7Q=="}',
        status: 'activated',
        terminalId: 2
      },
      {
        id: '1KvvAsuaeNr46hOSS5xOj1BCHbW',
        keys: '{"id":"1KvvAsuaeNr46hOSS5xOj1BCHbW","cbk":"cb1","k":"5zj/twWrIWErzQUbNEcu7n4h+132/Fu0DbXCaMPHB5JJSWFrJeMjjyPBbQHnXk0douL/3vjZobrsrpyK78UvAA=="}',
        status: 'activated',
        terminalId: 3
      }
    ]
    , {})
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('cipherboxKey', null, {})
  }
}
