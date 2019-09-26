'use strict'

const { normalizeSpace } = require('../libs/string').templateTags

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      normalizeSpace`
        UPDATE
          \`transaction\`, \`acquirer\`
        SET
          \`transaction\`.\`processFee\` = \`acquirer\`.\`processFee\`,
          \`transaction\`.\`shareAcquirer\` = \`acquirer\`.\`shareAcquirer\`,
          \`transaction\`.\`shareMerchant\` = \`acquirer\`.\`shareMerchant\`
        WHERE
          \`transaction\`.\`acquirerId\` = \`acquirer\`.\`id\`
      `
    )
  },
  down: (queryInterface, Sequelize) => Promise.resolve()
}
