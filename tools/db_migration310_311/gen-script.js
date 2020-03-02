'use strict'

const fs = require('fs')
const hb = require('handlebars')
const path = require('path')
const parameter = require('commander')
const { URL } = require('url')

parameter
  .requiredOption('-s, --src [url]', 'Source Database URL e.g mysql://username:password@localhost:3306/database')
  .requiredOption('-d, --dest [url]', 'Destination Database URL e.g postgresql://username:password@localhost:5432/database')

  .parse(process.argv)

async function begin () {
  const source = new URL(parameter.src)
  const config = {}
  config.mysqlDatabase = (source.pathname.split('/'))[1]
  config.mysqlUser = source.username
  config.mysqlPass = source.password
  config.mysqlHost = source.hostname
  config.mysqlPort = source.port || 3306

  const destination = new URL(parameter.dest)
  config.pgDatabase = (destination.pathname.split('/'))[1]
  config.pgUser = destination.username
  config.pgPass = destination.password
  config.pgHost = destination.hostname
  config.pgPort = destination.port || 5432

  config.mysqlDatabaseOriginal = config.mysqlDatabase
  config.mysqlDatabase = `${config.mysqlDatabase}_migrate_${(new Date()).getTime()}`

  const migrationFilePath = path.join(__dirname, 'template', 'migration.load')
  const preMigrationSqlFilePath = path.join(__dirname, 'template', 'premigration.sql')
  const migrationScriptFilePath = path.join(__dirname, 'template', 'migration.sh')

  const migrationLoad = hb.compile(fs.readFileSync(migrationFilePath).toString())
  const preMigrationSql = hb.compile(fs.readFileSync(preMigrationSqlFilePath).toString())
  const migrationScript = hb.compile(fs.readFileSync(migrationScriptFilePath).toString())

  const migrationScriptContent = migrationScript({
    ...config,
    preMigrationSql: preMigrationSql(config),
    migrationLoad: migrationLoad(config)
  })

  console.log(migrationScriptContent)
}

begin()
