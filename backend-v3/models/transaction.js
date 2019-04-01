'use strict'

module.exports = (sequelize, DataTypes) => {
  let transaction = sequelize.define('transaction', {
    amount: DataTypes.INTEGER,

    transactionStatus: DataTypes.STRING,
    transactionSettlementStatus: DataTypes.STRING,

    token: DataTypes.STRING,
    tokenType: DataTypes.STRING,

    userToken: DataTypes.STRING,
    userTokenType: DataTypes.STRING,

    customerReference: DataTypes.STRING,
    customerReferenceType: DataTypes.STRING,
    referenceNumber: DataTypes.STRING,
    referenceNumberType: DataTypes.STRING,

    cardApprovalCode: DataTypes.STRING,
    cardNetwork: DataTypes.STRING,
    cardIssuer: DataTypes.STRING,
    cardAcquirer: DataTypes.STRING,
    cardType: DataTypes.STRING,

    aliasThumbnail: DataTypes.STRING,
    aliasThumbnailGray: DataTypes.STRING,

    locationLong: DataTypes.STRING,
    locationLat: DataTypes.STRING,
    ipAddress: DataTypes.STRING,

    voidReason: DataTypes.TEXT,

    extra: {
      type: DataTypes.TEXT,
      get () {
        try {
          return JSON.parse(this.getDataValue('extra'))
        } catch (error) {}
        return null
      },
      set (value) {
        if (typeof value === 'object') {
          this.setDataValue('extra', JSON.stringify(value))
        }
        return this.setDataValue('extra', null)
      }
    },

    partnerId: DataTypes.INTEGER,
    agentId: DataTypes.INTEGER,
    terminalId: DataTypes.INTEGER,
    paymentProviderId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  transaction.associate = (models) => {
    transaction.belongsTo(models.partner, { foreignKey: 'partnerId' })
    transaction.belongsTo(models.agent, { foreignKey: 'agentId' })
    transaction.belongsTo(models.terminal, { foreignKey: 'terminalId' })
    transaction.belongsTo(models.paymentProvider, { foreignKey: 'paymentProviderId' })

    transaction.hasMany(models.transactionRefund, { foreignKey: 'transactionId' })
  }
  return transaction
}
