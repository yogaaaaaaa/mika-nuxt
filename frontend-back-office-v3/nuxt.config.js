const pkg = require("./package");

const nodeExternals = require("webpack-node-externals");

module.exports = {
  mode: "universal",

  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: pkg.description }
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css?family=Raleway:300,400,500,700|Material+Icons"
      }
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#FFFFFF" },

  /*
   ** Global CSS
   */
  css: ["vuetify/src/stylus/main.styl"],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    "@/plugins/vuetify",
    "~/plugins/veeValidate.js",
    { src: "~/plugins/datePicker.js", ssr: false }
  ],

  /*
   ** Nuxt.js modules
   */
  modules: ["@nuxtjs/axios", "@nuxtjs/auth"],

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    analyze: true,
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: "pre",
          test: /\.(js|vue)$/,
          loader: "eslint-loader",
          exclude: /(node_modules)/,
          options: {
            fix: true
          }
        });
      }
      if (ctx.isServer) {
        config.externals = [
          nodeExternals({
            // whitelist: [/^vuetify/]
            whitelist: [/\.(?!(?:js|json)$).{1,5}$/i, /^vue-picture-input/]
          })
        ];
      }
    }
  },
  axios: {
    // baseURL: "https://stg12api.mikaapp.id/"
    baseURL: "https://stg31api.mikaapp.id/"
  },
  router: {
    middleware: ["auth"]
  },
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: {
            url: "/api/auth/login",
            method: "post",
            propertyName: "data.sessionToken"
          },
          user: {
            url: "/api/back_office/admin",
            method: "get",
            propertyName: "data"
          },
          logout: {
            url: "/api/auth/logout",
            method: "post"
          }
        }
      }
    }
  }
};
