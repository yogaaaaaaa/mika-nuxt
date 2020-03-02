'use strict'

module.exports = (sequelize, DataTypes) => {
  const cardIssuer = sequelize.define('cardIssuer', {
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

  cardIssuer.addScope('admin', {
    paranoid: false
  })

  cardIssuer.associate = (models) => {
  }

  return cardIssuer
}
