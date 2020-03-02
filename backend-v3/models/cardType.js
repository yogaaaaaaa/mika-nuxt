'use strict'

module.exports = (sequelize, DataTypes) => {
  const cardType = sequelize.define('cardType', {
    id: {
      primaryKey: true,
      type: DataTypes.STRING(64)
    },

    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  cardType.addScope('admin', {
    paranoid: false
  })

  cardType.associate = (models) => {
  }
  return cardType
}
