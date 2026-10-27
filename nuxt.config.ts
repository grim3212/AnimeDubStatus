import tailwindcss from '@tailwindcss/vite'
import { withCspMeta } from './infra/lib/csp'

// https://nuxt.com/docs/api/configuration/nuxt-config
// The site is fully static (`nuxt generate`) and served from S3 + CloudFront. Data comes from
// /data/*.json (written daily by jobs/refresh-data.ts) and, for searches, the AniList API.
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Anime Dub Status',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#111827' },
        {
          name: 'description',
          content: 'Find out if an anime has an English dub, and see which dubs are airing this week.',
        },
        { property: 'og:title', content: 'Anime Dub Status' },
        {
          property: 'og:description',
          content: 'Find out if an anime has an English dub, and see which dubs are airing this week.',
        },
        { property: 'og:url', content: 'https://animedubstatus.com/' },
        { property: 'og:site_name', content: 'Anime Dub Status' },
        { property: 'og:locale', content: 'en_US' },
        { name: 'msapplication-config', content: '/browserconfig.xml' },
      ],
      link: [
        { rel: 'canonical', href: 'https://animedubstatus.com/' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2026-10-01',
  nitro: {
    hooks: {
      // Give every generated page a CSP that allows exactly its own inline scripts.
      'prerender:generate'(route) {
        if (typeof route.contents === 'string' && route.fileName?.endsWith('.html')) {
          route.contents = withCspMeta(route.contents)
        }
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  eslint: {
    config: {
      stylistic: { semi: false, quotes: 'single', commaDangle: 'always-multiline' },
    },
  },
})
