
module.exports = {
  apps: [
    {
      name: 'mika-mqtt-broker',
      script: 'index.js',
      exec_mode: 'fork',
      watch: false,
      time: true,
      env: {
        NODE_ENV: '',
        NODE_CONFIG_DIR: ''
      }
    }
  ]
}
