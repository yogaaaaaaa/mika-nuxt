'use strict'

module.exports = (sequelize, DataTypes) => {
  let cipherboxKey = sequelize.define('cipherboxKey', {
    id: {
      primaryKey: true,
      type: DataTypes.CHAR(27)
    },

    keys: DataTypes.TEXT,
    status: DataTypes.CHAR(32),

    terminalId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })

  cipherboxKey.addScope('created', {
    where: {
      status: 'created'
    }
  })
  cipherboxKey.addScope('activated', {
    where: {
      status: 'activated'
    }
  })
  cipherboxKey.addScope('removed', {
    where: {
      status: 'removed'
    }
  })

  cipherboxKey.associate = function (models) {
    cipherboxKey.belongsTo(models.terminal, { foreignKey: 'terminalId' })
  }

  return cipherboxKey
}
