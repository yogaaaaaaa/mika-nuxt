module.exports = {
  /**
   * Redis URI, used by broker and auth
   */
  redisUri: 'redis://localhost',

  /**
   * Redis auth configuration
   */
  authEnabled: true,
  authPattern: 'mqtt-broker:auth:%u', // Pattern for username
  authAclPattern: 'mqtt-broker:acl:%u:%t', // Pattern for acl
  authRootUser: 'superuser',
  authRootPassword: null, // Optional, put password here if you want broker to set the superuser password

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
