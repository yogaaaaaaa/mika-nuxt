'use strict'

module.exports = (sequelize, DataTypes) => {
  const cipherboxKey = sequelize.define('cipherboxKey', {
    id: {
      primaryKey: true,
      type: DataTypes.CHAR(27)
    },

    keys: DataTypes.TEXT,
    status: DataTypes.CHAR(32),

    terminalId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
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
