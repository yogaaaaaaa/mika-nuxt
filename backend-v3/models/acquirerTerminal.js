'use strict'

const counter = require('./helpers/counter')

module.exports = (sequelize, DataTypes) => {
  const acquirerTerminal = sequelize.define('acquirerTerminal', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    mid: DataTypes.STRING,
    tid: DataTypes.STRING,

    traceNumberCounter: DataTypes.INTEGER,

    type: DataTypes.STRING,
    config: DataTypes.JSONB,

    acquirerTerminalCommonId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  acquirerTerminal.prototype.incrementTraceCounter = counter.generateCounterFunction({
    attribute: 'traceNumberCounter',
    min: 999001,
    max: 999999
  })

  acquirerTerminal.associate = (models) => {
    acquirerTerminal.belongsTo(models.acquirerTerminalCommon, { foreignKey: 'acquirerTerminalCommonId' })
  }

  acquirerTerminal.addScope('excludeConfig', {
    attributes: {
      exclude: [
        'config'
      ]
    }
  })

  acquirerTerminal.addScope('admin', () => ({
    paranoid: false,
    include: [
      {
        model: sequelize.models.acquirerTerminalCommon,
        paranoid: false,
        include: [
          {
            model: sequelize.models.acquirerCompany,
            paranoid: false
          }
        ]
      }
    ]
  }))

  return acquirerTerminal
}
