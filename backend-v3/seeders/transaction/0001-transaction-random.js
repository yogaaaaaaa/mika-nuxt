'use strict'

const { normalizeSpace } = require('../../libs/string').templateTags
const fake = require('../../libs/fake')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize

    const dateStart = new Date('2017-01-01T00:00:00.000Z')
    const dateEnd = new Date()
    const generateCount = 1000
    const perMerchantGenerateBlockCount = 10

    const merchants = (await sequelize.query(
      normalizeSpace`
        SELECT 
          "id" 
        FROM 
          "merchant"
      `
    ))[0]

    for (const merchant of merchants) {
      merchant.agentIds =
        (await sequelize.query(
          normalizeSpace`
            SELECT 
              "agent"."id" AS "id"
            FROM
              "agent"
              INNER JOIN
                "outlet" ON 
                (
                  "agent"."outletId" = "outlet"."id" AND 
                  "outlet"."merchantId" = ${sequelize.escape(merchant.id)}
                )
          `
        ))[0].map(agent => agent.id)
      merchant.acquirerIds =
        (await sequelize.query(
          normalizeSpace`
            SELECT 
              "id"
            FROM
              "acquirer"
            WHERE
              "merchantId" = ${sequelize.escape(merchant.id)}
          `
        ))[0].map(acquirer => acquirer.id)
    }

    const generate = async (merchant, count = 100) => fake.transactions(
      {
        agentIds: merchant.agentIds,
        acquirerIds: merchant.acquirerIds,
        dateStart: dateStart,
        dateEnd: dateEnd,
        count: count
      }
    )

    for (const merchant of merchants) {
      let count = perMerchantGenerateBlockCount
      while (count) {
        await queryInterface.bulkInsert(
          'transaction',
          await generate(merchant, generateCount),
          {}
        )
        count--
      }
    }

    queryInterface.sequelize.query(
      normalizeSpace`
        UPDATE
          "transaction"
        SET
          "processFee" = "acquirer"."processFee",
          "shareAcquirer" = "acquirer"."shareAcquirer",
          "shareMerchant" = "acquirer"."shareMerchant"
        FROM
          "acquirer"
        WHERE
          "transaction"."acquirerId" = "acquirer"."id"
      `
    )

    queryInterface.sequelize.query(
      normalizeSpace`
        UPDATE
          "transaction"
        SET
          "references" = '{}',
          "properties" = '{}'
      `
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('transaction', null, {})
  }
}
