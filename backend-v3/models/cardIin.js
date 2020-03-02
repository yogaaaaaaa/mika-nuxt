'use strict'

module.exports = (sequelize, DataTypes) => {
  const Op = sequelize.Sequelize.Op

  const cardIin = sequelize.define('cardIin', {
    name: DataTypes.STRING,
    pattern: DataTypes.STRING,
    description: DataTypes.STRING,
    priority: DataTypes.INTEGER,
    validation: DataTypes.STRING,

    cardTypeId: DataTypes.STRING(64),
    cardSchemeId: DataTypes.STRING(64),
    cardIssuerId: DataTypes.STRING(64)
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  cardIin.associate = (models) => {
    cardIin.belongsTo(models.cardType, { foreignKey: 'cardTypeId' })
    cardIin.belongsTo(models.cardScheme, { foreignKey: 'cardSchemeId' })
    cardIin.belongsTo(models.cardIssuer, { foreignKey: 'cardIssuerId' })
  }

  cardIin.addScope('info', () => ({
    order: [
      ['priority', 'asc']
    ],
    include: [
      {
        model: sequelize.models.cardType,
        required: true
      },
      {
        model: sequelize.models.cardScheme,
        required: true
      },
      {
        model: sequelize.models.cardIssuer,
        required: true
      }
    ]
  }))

  cardIin.addScope('findPattern', (value) => {
    const where = {}
    if (value) {
      where[Op.and] = sequelize.literal(`${sequelize.escape(value)} SIMILAR TO "pattern"`)
    }
    return {
      where
    }
  })

  cardIin.addScope('admin', () => ({
    paranoid: false,
    include: [
      sequelize.models.cardScheme.scope('paranoid'),
      sequelize.models.cardIssuer.scope('paranoid')
    ]
  }))

  return cardIin
}
