<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useServerSeoMeta({
  title: 'Anime Dub Status',
  ogTitle: 'Anime Dub Status',
  description: 'Find out if an anime has been dubbed. Also find out which dubs are currently airing.',
  ogDescription: 'Find out if an anime has been dubbed. Also find out which dubs are currently airing.',
  ogLocale: 'en',
  ogUrl: 'https://animedubstatus.com/',
  ogSiteName: 'Anime Dub Status',
})

useServerHeadSafe({
  link: [
    {
      rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png'
    },
    {
      rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png'
    },
    {
      rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-chrome-192x192.png'
    },
    {
      rel: 'icon', type: 'image/png', sizes: '256x256', href: '/android-chrome-256x256.png'
    },
    {
      rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png'
    },
    {
      rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5'
    },
    {
      rel: 'manifest', href: '/site.webmanifest'
    }
  ],
  meta: [
    {
      name: 'msapplication-Config', content: '/browserconfig.xml'
    },
    {
      name: 'msapplication-TileImage', content: '/mstile-150x150.png'
    }
  ]
})
</script>
