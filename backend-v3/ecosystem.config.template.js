'use strict'

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
        NODE_ENV: 'development',
        MIKA_CONFIG_GROUP: ''
      }
    },
    {
      name: 'mika-v3-report-dev',
      script: 'apps/report.js',
      exec_mode: 'fork',
      watch: true,
      node_args: ['--inspect=127.0.0.1:9992'],
      ignore_watch: ignoreWatch,
      time: true,
      env: {
        NODE_ENV: 'development',
        MIKA_CONFIG_GROUP: ''
      }
    }
  ]
}

const productionConfig = {
  apps: [
    {
      name: 'mika-v3-core',
      script: 'apps/core.js',
      exec_mode: 'cluster',
      instances: 0,
      instance_var: 'NODE_APP_INSTANCE',
      watch: false,
      time: true,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'mika-v3-report',
      script: 'apps/report.js',
      exec_mode: 'fork',
      instances: 2,
      instance_var: 'NODE_APP_INSTANCE',
      watch: false,
      time: true,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}

if (process.env.NODE_ENV === 'production') {
  module.exports = productionConfig
} else {
  module.exports = developmentConfig
}
