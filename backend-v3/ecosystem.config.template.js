'use strict'

const ignoreWatchDev = [
  'node_modules',
  '*.log',
  'uploads',
  'cache'
]

const developmentPm2 = {
  apps: [
    {
      name: 'mika-v3-core-dev',
      script: 'apps/core.js',
      exec_mode: 'fork',
      watch: true,
      ignore_watch: ignoreWatchDev,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'mika-v3-report-dev',
      script: 'apps/report.js',
      exec_mode: 'fork',
      watch: true,
      ignore_watch: ignoreWatchDev,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
}

const productionPm2 = {
  apps: [
    {
      name: 'mika-v3-core',
      script: 'apps/core.js',
      exec_mode: 'cluster',
      instances: 0,
      instance_var: 'NODE_APP_INSTANCE',
      watch: false,
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
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development'

if (process.env.NODE_ENV === 'production') {
  module.exports = productionPm2
} else if (process.env.NODE_ENV === 'development') {
  module.exports = developmentPm2
}
