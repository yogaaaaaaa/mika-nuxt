'use strict'

const { normalizeSpace } = require('../../libs/string').templateTags

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize
    const counter = 3000

    await sequelize.query(
      normalizeSpace`
        DO $$
        DECLARE i TEXT;
        BEGIN
          FOR i IN (SELECT "sequence_name" FROM information_schema.sequences) LOOP
            EXECUTE 'ALTER SEQUENCE ' || '"' || i || '"' || ' RESTART WITH ${counter};';
          END LOOP;
        END $$;
      `
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('transaction', null, {})
  }
}
