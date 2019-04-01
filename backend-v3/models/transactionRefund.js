'use strict'

module.exports = (sequelize, DataTypes) => {
  var transactionRefund = sequelize.define('transactionRefund', {
    amount: DataTypes.INTEGER,
    reason: DataTypes.TEXT,
    transactionId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  transactionRefund.associate = (models) => {
    transactionRefund.belongsTo(models.transaction, { foreignKey: 'transactionId' })
  }
  return transactionRefund
}
