module.exports = {
  redisUrl: 'redis://192.168.255.250',

  authEnabled: true,
  authPattern: 'mqtt-broker:mosq:%u',
  authAclPattern: 'mqtt-broker:mosqacl:%u:%t',
  authRootUser: 'superuser',

  servers: [
    {
      type: 'tcp', // 'tcp', 'ws'
      port: 1883
    },
    {
      type: 'ws',
      port: 8888
    }
  ]
}
