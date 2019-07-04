# Backend Part of mika (v3)

Welcome to backend part of mika ! An hybrid monolithic and microservices backend apps.
This project uses,
- For Core backend app, uses [express.js](https://expressjs.com/) framework. 
- For RPC and event messaging between services, [moleculer.js](https://moleculer.services) framework is used.
- For database framework, this project uses [sequelize.js](http://docs.sequelizejs.com/).

## Prerequisites
Component below is needed to start mika backend app
  - Nodejs >= 10
  - MariaDb/MySQL database
  - Redis
  - Mosquitto MQTT broker with mosquitto-auth plugin
  - Mosquitto MQTT broker for moleculer transporter
  
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

# Seeds
npm run db-seed-development
npm run db-seed-production
```
New schema MUST be added via migration and make sure any foreign key relation is valid.

## Configuration
Every configuration is located in `configs` directory. To override config with user defined one, 
just create a new config file with same name under `configs/_configs` directory.

For example, to override `dbConfig.js`, just create new file located in `configs/_configs/dbConfig.js`, that contain,
```js
module.exports = {
  development: {
    username: 'mikadev',
    password: 'mikadev',
    database: 'mika_v3_31'
  }
}
```
When configs is properly overridden, it will log `dbConfig is mixed` in startup sequence.


## Running
Copy `ecosystem.config.template.js` as `ecosystem.config.js`, then start using `pm2 start`.
To start certain apps, include `--only` as parameter for `pm2`.

```bash
npm -g install pm2 # install pm2 globally

cp ecosystem.config.template.js ecosystem.config.js
vi ecosystem.config.js # modify as needed

pm2 start # start all app
pm2 start --only mika-v3-report # start only certain app
```

## Environment
By default all apps/service will run in development environment (`NODE_ENV=development`) . For production mode, just set `NODE_ENV` to `production`.
If `NODE_ENV` is set to other than `production` it will treated as development environment.
