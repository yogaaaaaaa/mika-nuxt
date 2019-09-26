'use strict'

module.exports = (sequelize, DataTypes) => {
  const acquirerCompany = sequelize.define(
    'acquirerCompany',
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING
    },
    {
      timestamps: true,
      freezeTableName: true,
      deletedAt: 'archivedAt',
      paranoid: true
    }
  )
  acquirerCompany.addScope('admin', {
    paranoid: false
  })
  return acquirerCompany
}
