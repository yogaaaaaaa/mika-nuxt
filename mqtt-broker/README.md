# Mika MQTT Broker

A drop-in replacement for mosquitto with [mosquitto-auth-plugin](https://github.com/jpmens/mosquitto-auth-plug) 
functionality which is not maintained anymore.

This broker only implement redis-based authentication.

## Configuration
See `config/default.js`

This project uses [`node-config`](https://www.npmjs.com/package/config) 
as config provider. Please refer to [node config documentation](https://github.com/lorenwest/node-config/wiki) for more info