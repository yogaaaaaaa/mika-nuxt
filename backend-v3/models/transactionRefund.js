'use strict'

module.exports = (sequelize, DataTypes) => {
  var transactionRefund = sequelize.define('transactionRefund', {
    id: {
      primaryKey: true,
      type: DataTypes.CHAR(27)
    },

    amount: DataTypes.DECIMAL(28, 2),
    reason: DataTypes.TEXT,

    reference: DataTypes.STRING,
    referenceName: DataTypes.STRING,

    transactionId: DataTypes.CHAR(27)
  }, {
    timestamps: true,
    freezeTableName: true,
    paranoid: false
  })

  transactionRefund.associate = (models) => {
    transactionRefund.belongsTo(models.transaction, { foreignKey: 'transactionId' })
  }

  transactionRefund.addScope('excludeTransactionId', {
    attributes: { exclude: ['transactionId'] }
  })

  return transactionRefund
}
