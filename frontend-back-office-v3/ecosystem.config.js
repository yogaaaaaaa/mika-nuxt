module.exports = {
  apps: [
    {
      name: "Mika-Dashboard",
      script: "./node_modules/nuxt/bin/nuxt-start",
      env: {
        HOST: "0.0.0.0",
        PORT: 12001,
        NODE_ENV: "production"
      }
    }
  ]
};
