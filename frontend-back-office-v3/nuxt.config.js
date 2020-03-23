import colors from 'vuetify/es5/util/colors'
require('dotenv').config()

export default {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    // titleTemplate: "%s - " + process.env.npm_package_name,
    title: 'Mika Admin Dashboard',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui',
      },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/img/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Montserrat&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Nunito&display=swap',
      },
      {
        rel: 'stylesheet',
        href: '/css/style.css',
      },
    ],
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/moment',
    '~/plugins/changeCase',
    { src: '~/plugins/datePicker', ssr: false },
    '~/plugins/veeValidate',
    '~/plugins/chance',
    '~/plugins/filters',
    '~/plugins/clipboard',
    { src: '~/plugins/pictureInput', ssr: false },
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxtjs/vuetify'],
  /*
   ** Nuxt.js modules
   */
  modules: ['@nuxtjs/axios', '@nuxtjs/auth', '@nuxtjs/dotenv'],

  axios: {
    baseURL: process.env.API_URL,
  },
  // https://stg31api.mikaapp.id
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: {
            url: `/auth/login`,
            method: 'post',
            propertyName: 'data.sessionToken',
          },
          logout: false,
          user: {
            url: `/back_office/admin `,
            method: 'get',
            propertyName: 'data',
          },
        },
        tokenRequired: true,
        tokenType: 'bearer',
      },
    },
  },
  router: {
    middleware: ['auth'],
  },

  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#3BAAE0',
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          // warning: colors.amber.base,
          warning: '#ffae42',
          error: colors.deepOrange.accent4,
          success: colors.green.darken1,
        },
      },
    },
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
        })
      }
    },
  },
}
