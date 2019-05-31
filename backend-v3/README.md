# Backend Part of mika (v3)

Welcome to mika backend ! 

This backend app written for node.js and mainly uses [express.js](https://expressjs.com/) framework. 
While this framework is un-opinionated, Maintainer is expected to follow established style exist in this project.

For database framework, this project uses [sequelize.js](http://docs.sequelizejs.com/).

## Standard Style
[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

This project adhere strictly to standard.js style. 

Please run `standard --fix` BEFORE committing any javascript source code.

## Migrations and Seeder
Use sequelize cli to migrate database schema, all database configuration is stored in `configs/dbConfig.json` file.
```bash
# Drop and Create database
npm run db-drop
npm run db-create

# Migrations
npm run db-migrate

# Seedings
npm run db-seed
```
New schema MUST be added via migration and make sure any foreign key relation is valid.

## Prerequisites
Services below is needed to start mika backend app
  - SQL database (anything supported by sequelize)
  - Redis
  - Mosquitto MQTT broker with mosquitto-auth plugin

## Configuration
