export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'sardoon',
    htmlAttrs: {
      lang: 'ru',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '../static/css/scrollbar.css',
    '../static/css/main.css',
    '../static/css/wide.css',
    '../static/fonts/font-Merriweather.css',
    '../static/fonts/font-OpenSans.css',
    '../static/vendor/font-awesome/css/all.min.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['~/plugins/mixinCommonMethods', '~/plugins/VueGalleryPlugin'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: {
    dirs: [
      '~/components'
    ]
  },

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://auth.nuxtjs.org/guide/setup
    '@nuxtjs/auth-next',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: process.env.API_HOST,
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},

  // https://auth.nuxtjs.org/guide/middleware
  router: {
    middleware: ['auth'],
  },
  env: {
    baseURL: process.env.API_HOST,
    tile_server: process.env.TILE_SERVER,
    search_server: process.env.SEARCH_SERVER,
  },
  auth: {
    redirect: {
      login: '/login',
      logout: '/login',
      home: '/'
    },
    strategies: {
      local: {
        scheme: 'refresh',
        token: {
          property: 'access',
          maxAge: 300,
          global: true,
          type: 'Bearer',
        },
        refreshToken: {
          property: 'refresh',
          data: 'refresh',
          maxAge: 60 * 60 * 24 * 7,
          required: true,
        },
        user: {
          propery: 'user',
        },
        endpoints: {
          login: { url: '/api/v1/auth/api-token-auth/', method: 'post' },
          refresh: { url: '/api/v1/auth/api-token-refresh/', method: 'post' },
          user: { url: '/api/v1/auth/user/', method: 'get' },
          logout: { url: '/api/v1/auth/logout/', method: 'post' },
        },
      },
    },
  },
}
