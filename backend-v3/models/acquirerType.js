'use strict'

module.exports = (sequelize, DataTypes) => {
  const acquirerType = sequelize.define('acquirerType', {
    class: DataTypes.STRING,

    name: DataTypes.STRING,
    description: DataTypes.STRING,

    thumbnail: DataTypes.STRING,
    thumbnailGray: DataTypes.STRING,
    chartColor: DataTypes.STRING
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  acquirerType.associate = (models) => {
    acquirerType.hasMany(models.acquirer, { foreignKey: 'acquirerTypeId' })
  }

  acquirerType.addScope('admin', {
    paranoid: false
  })

  acquirerType.addScope('agent', {
    paranoid: false
  })

  return acquirerType
}
