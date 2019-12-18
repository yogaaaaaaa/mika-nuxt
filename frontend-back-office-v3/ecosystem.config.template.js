module.exports = {
  apps: [
    {
      name: 'mika-v3-backoffice-dev',
      script: './node_modules/nuxt/bin/nuxt.js',
      args: 'start',
      env: {
        HOST: '0.0.0.0',
        PORT: 22000,
        NODE_ENV: 'development',
      },
    },
  ],
}
