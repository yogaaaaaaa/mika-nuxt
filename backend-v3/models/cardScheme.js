'use strict'

module.exports = (sequelize, DataTypes) => {
  const cardScheme = sequelize.define('cardScheme', {
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

  cardScheme.addScope('admin', {
    paranoid: false
  })

  cardScheme.associate = (models) => {
  }

  return cardScheme
}
