'use strict'

module.exports = (sequelize, DataTypes) => {
  const acquirerTerminalCommon = sequelize.define('acquirerTerminalCommon', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    config: DataTypes.JSONB,

    acquirerCompanyId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  acquirerTerminalCommon.associate = (models) => {
    acquirerTerminalCommon.belongsTo(models.acquirerCompany, { foreignKey: 'acquirerCompanyId' })
  }

  acquirerTerminalCommon.addScope('excludeConfig', {
    attributes: {
      exclude: [
        'config'
      ]
    }
  })

  acquirerTerminalCommon.addScope('admin', () => ({
    paranoid: false,
    include: [
      {
        model: sequelize.models.acquirerCompany,
        paranoid: false
      }
    ]
  }))

  return acquirerTerminalCommon
}
