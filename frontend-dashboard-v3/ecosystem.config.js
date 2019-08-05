module.exports = {
  apps: [
    {
      name: "mika-v3-dashboard",
      script: "./node_modules/nuxt/bin/nuxt-start",
      env: {
        HOST: "0.0.0.0",
        PORT: 4444,
        NODE_ENV: "production"
      }
    }
  ]
};
