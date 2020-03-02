#!/bin/bash

# create working directory
WORKDIR=$(mktemp -d)
cd "$WORKDIR"

# clone mysql database under different name
mysqladmin -u {{mysqlUser}} -p{{mysqlPass}} -h {{mysqlHost}} -P {{mysqlPort}} create {{mysqlDatabase}}
mysqldump -u {{mysqlUser}} -p{{mysqlPass}} -h {{mysqlHost}} -P {{mysqlPort}} {{mysqlDatabaseOriginal}} > "db.sql"
mysql -u {{mysqlUser}} -p{{mysqlPass}} -h {{mysqlHost}} -P {{mysqlPort}} {{mysqlDatabase}} < "db.sql"

# pre migration script
mysql -u {{mysqlUser}} -p{{mysqlPass}} -h {{mysqlHost}} -P {{mysqlPort}} <<"PREMIGRATIONSQL"
{{{preMigrationSql}}}
PREMIGRATIONSQL

# migration script
cat <<"MIGRATIONLOAD" > "migration.load"
{{{migrationLoad}}}
MIGRATIONLOAD

pgloader "migration.load"
mysqladmin -u {{mysqlUser}} -p{{mysqlPass}} -h {{mysqlHost}} -P {{mysqlPort}} drop {{mysqlDatabase}}