# Backend Part of mika (v3)

Welcome to backend part of mika ! An hybrid monolithic and microservices backend apps.
This project uses,
- [express.js](https://expressjs.com/) as primary web framework, used by core service.
- [moleculer.js](https://moleculer.services) for RPC and event messaging between services.
- [sequelize.js](http://docs.sequelizejs.com/) as database framework.

## Prerequisites
Component below is needed to start mika backend app
  - Nodejs >= 10
  - PostgreSQL 11.5
  - Redis
  - Mosquitto MQTT broker with mosquitto-auth plugin (MQTT Notification)
  - Mosquitto MQTT broker for moleculer transporter (inter-service communication)

See `vagrant/provision.sh` to see detailed step to re-crete development environment

## Standard Style
[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

This project adhere strictly to standard.js style. 

Please run `npm run standard` BEFORE committing any javascript source code.

## Migrations and Seeder
Use sequelize cli to migrate database schema, all database configuration is stored in `configs/dbConfig.json` file.
```bash
# Drop and Create database
npm run db-drop
npm run db-create

# Create/Recreate and migrate database
npm run db-recreate-migrate

# Migrations
npm run db-migrate
# Migrations undo
npm run db-migrate-undo

# Seeds
npm run db-seed-development
npm run db-seed-production

# Seeds Card IIN data
npm run db-seed-card-iin

# Seed about 50k fake transaction data
npm run db-seed-transaction
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
By default all apps/service will run in development environment (`NODE_ENV=development`) . 
For production mode, just set `NODE_ENV` to `production`. If `NODE_ENV` is set to other than `production` it will treated as development environment.

## Mosquitto auth Plugin
Please see https://github.com/jpmens/mosquitto-auth-plug for more information.

For MQTT notification, mika backend use Mosquitto with `mosquitto-auth` plugin 
with Redis backend for dynamic creation of mosquitto user. 

Set `auth_opt_redis_userquery` and `auth_opt_redis_aclquery` in mosquitto 
configuration to use same prefix. Default pattern for each environment is,
- For `NODE_ENV=production`
    - `mika-v3:mosq:%s` for user query 
    - `mika-v3:mosqacl:%s:%s` for acl query
- For `NODE_ENV=development`
    - `mika-v3-dev:mosq:%s` for user query
    - `mika-v3-dev:mosqacl:%s:%s:` for acl query

Please define superuser name in `auth_opt_superusers` and set its password with
`np`, see https://github.com/jpmens/mosquitto-auth-plug#creating-a-user

Example of mosquitto-auth-plugin in `mosquitto.conf`
```
auth_opt_backends redis 
# use local redis server
auth_opt_redis_host 127.0.0.1
auth_opt_redis_port 6379
auth_opt_redis_pass redispassword
auth_opt_redis_userquery GET mika-v3:mosq:%s
auth_opt_redis_aclquery GET mika-v3:mosqacl:%s:%s
auth_opt_superusers superuser
auth_opt_acl_cacheseconds 0
auth_opt_auth_cacheseconds 0
auth_opt_acl_cachejitter 0
auth_opt_auth_cachejitter 0
auth_opt_log_quiet true
``` 