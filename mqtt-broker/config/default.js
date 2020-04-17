module.exports = {
  /**
   * Redis URI, used by broker and auth
   */
  redisUri: 'redis://localhost',

  /**
   * Redis auth configuration
   */
  authEnabled: true,
  authPattern: 'mqtt-broker:auth:%u',
  authAclPattern: 'mqtt-broker:acl:%u:%t',
  authRootUser: 'superuser',
  authRootPassword: null, // Optional

  /**
   * Listening servers
   * Supported type : 'tcp', 'ws' (websocket)
   */
  servers: [
    {
      type: 'tcp',
      port: 1883
    },
    {
      type: 'ws',
      port: 8888
    }
  ]
}
