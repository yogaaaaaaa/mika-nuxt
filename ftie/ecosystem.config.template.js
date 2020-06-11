const developmentConfig = {
  apps: [
    {
      name: 'ftie-dev',
      script: '/usr/bin/java',
      args: '-jar target/ftie-1.1.0.jar',
      exec_interpreter: 'none',
      exec_mode: 'fork',
      watch: true,
      time: true,
      env: {
        SERVER_PORT: '9090',
        LOGGING_LEVEL_ID_GETMIKA: 'DEBUG'
      }
    }
  ]
}

const productionConfig = {
  apps: [
    {
      name: 'ftie',
      script: '/usr/bin/java',
      args: '-jar target/ftie-1.1.0.jar',
      exec_interpreter: 'none',
      exec_mode: 'fork',
      watch: false,
      time: true,
      env: {
        SERVER_PORT: '9090'
      }
    }
  ]
}

module.exports = productionConfig
module.exports = developmentConfig
