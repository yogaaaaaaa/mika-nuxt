const developmentConfig = {
  apps: [
    {
      name: 'ftie-dev',
      script: '/usr/bin/java',
      args: '-jar target/ftie-0.0.6-SNAPSHOT.jar',
      exec_interpreter: 'none',
      exec_mode: 'fork',
      watch: true,
      ignore_watch: ['target/ftie-0.0.6-SNAPSHOT.jar'],
      time: true,
      env: {}
    }
  ]
}

const productionConfig = {
  apps: [
    {
      name: 'ftie',
      script: '/usr/bin/java',
      args: '-jar target/ftie-0.0.6-SNAPSHOT.jar',
      exec_interpreter: 'none',
      exec_mode: 'fork',
      watch: false,
      time: true,
      env: {}
    }
  ]
}

module.exports = productionConfig
module.exports = developmentConfig
