# Mika Core API Installation
Before installation, make sure that prerequisites component is already installed in 
target system. For more detailed information, see `README.md`

This documentations assume installation for `development` environment.

## Clone the codebase
This codebase is a part of larger monolithic repository, therefore it is recommended to clone this codebase using [sparse-checkout](https://medium.com/@atulsingh0/git-use-sparse-checkout-pull-specific-folder-from-repository-1091b2da52bf) to clone backend codebase only.
Setup repository directory using the usual `git init`, set origin and then to clone only `backend-v3` directory, create file in `.git/info/sparse-checkout`
```
backend-v3/*
```
## NODE_ENV Variable
See `README.md` for detailed information.
It is recommended that `development` and `production` has separate database, redis, and mosquitto server.

## Common Configuration
Create common configuration for your target host. 
First, create new directory `_configs` under `configs` to place user defined configuration.
To default configuration for each file, just open any configuration file in `configs`.

### Database configuration
Create new database configuration in `configs/_configs/dbConfig.js`
```js
module.exports = {
  development: { // NODE_ENV=development
    database: 'mika-v3-dev',
    username: 'admin',
    password: 'password',
    host: '192.168.0.103',
    port: 5432  
  }
}
```
### Redis configuration
Create new redis configuration in `configs/_configs/dbConfig.js`.
```js
module.exports = {
  urls: 'redis://user:password@127.0.0.1' // redis host
}
```
If redis run in cluster mode, `urls` properties can be replaced with array
of redis urls.
```js
module.exports = {
  urls: 
    [
      'redis://user:password@192.168.1.20',
      'redis://user:password@192.168.1.21'
    ]
}
```
### MQTT Notification Configuration
Please see `README.md` for detailed information.

Create new MQTT notification configuration in `configs/_configs/mqttConfig.js`
```js
module.exports = {
  url: 'mqtt://localhost:1893', // default mosquitto-auth-plugin password
  superuserName: 'superuser',
  superuserPassword: 'superuserpassword'
}
```
Next, create notification configuration file in `configs/_configs/notifConfig.js`.
```js
module.exports = {
  brokerUrl: 'wss://stg31broker.mikaapp.id', // external url to connect to notif mqtt broker
  brokerUrlAlt: 'mqtts://stg31broker.mikaapp.id:8893' // alternative external url to connect to notif mqtt broker
}
```
### Service Broker Config
Create MQTT for inter-service communication configuration in `configs/_configs/serviceBrokerConfig.js`
```js
module.exports = {
  transporter: 'mqtt://username:password@localhost:5000' // broker url
}
```
Please note that. This mqtt configuration is different from mqtt for notification.

### Application config
Create file in `configs/_configs/commonConfig.js`,
```js
module.exports = {
  baseUrl: 'https://stg31api.mikaapp.id' // url core api when accessed externally
}
```

### FTIE Config for BNI Host
Create new configuration file in `configs/_configs/aqBniConfig.js`
```js
module.exports = {
  ftieBaseUrl: 'http://192.168.1.100:9090', // ftie url
  hostAddress: '10.40.2.12', // bni host address
  hostPort: '2010' // bni host port
}
```

## Database migration
Make sure database is configured and database connection config is already defined
in `dbConfig.js`.
```bash
# We are in development
exports NODE_ENV=development 

# Create/Recreate database and run table migration
npm run db-recreate-migrate

# Seed for development
npm run db-seed-development
# Seeds Card IIN data
npm run db-seed-card-iin
```
## PM2 config and Start
Create `ecosystem.config.js` in root of codebase directory. For more detailed template,
see `ecosystem.config.template.js`
```js
const ignoreWatch = [
  'node_modules',
  '*.log',
  'uploads',
  'cache'
]

const developmentConfig = {
  apps: [
    {
      name: 'mika-v3-core-dev',
      script: 'apps/core.js',
      exec_mode: 'fork',
      watch: true,
      node_args: ['--inspect=127.0.0.1:9991'],
      ignore_watch: ignoreWatch,
      time: true,
      env: {
        NODE_ENV: 'development', // define your environment variable here
        MIKA_CONFIG_GROUP: ''
      }
    }
}
```

## Starting
Make sure that PM2 is properly configured, then change to codebase root directory
and use `pm2 start` to start Core API apps.

