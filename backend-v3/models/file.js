'use strict'

module.exports = (sequelize, DataTypes) => {
  const file = sequelize.define('file', {
    id: {
      primaryKey: true,
      type: DataTypes.CHAR(27)
    },

    originalFilename: DataTypes.STRING,
    hash: DataTypes.STRING,
    mime: DataTypes.STRING,
    size: DataTypes.INTEGER,

    resourceId: DataTypes.CHAR(27)
  }, {
    timestamps: true,
    freezeTableName: true,
    paranoid: false
  })

  file.associate = (models) => {
    file.belongsTo(models.resource, { foreignKey: 'resourceId' })
  }

  return file
}
