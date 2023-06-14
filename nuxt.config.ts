// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/eslint-module'
  ],
  app: {
    rootId: 'app'
  },
  nitro: {
    preset: 'aws-lambda'
  }
})
