'use strict'

module.exports = (sequelize, DataTypes) => {
  var transactionRefund = sequelize.define('transactionRefund', {
    id: {
      primaryKey: true,
      type: DataTypes.CHAR(27)
    },

    amount: DataTypes.INTEGER,
    reason: DataTypes.TEXT,
    transactionId: DataTypes.CHAR(27)
  }, {
    freezeTableName: true,
    paranoid: true
  })
  transactionRefund.associate = (models) => {
    transactionRefund.belongsTo(models.transaction, { foreignKey: 'transactionId' })
  }
  return transactionRefund
}
