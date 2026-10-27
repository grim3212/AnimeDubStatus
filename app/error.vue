<template>
  <div class="flex min-h-dvh flex-col">
    <main class="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p class="text-7xl font-extrabold text-sky-400">
        {{ error.statusCode }}
      </p>
      <p class="text-2xl font-bold text-slate-100">
        {{ error.statusCode === 404 ? 'This page doesn\'t exist' : 'Something went wrong' }}
      </p>
      <button
        type="button"
        class="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500"
        @click="clearError({ redirect: '/' })"
      >
        Go home
      </button>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

useHead({ title: () => `${props.error.statusCode} · Anime Dub Status` })
</script>
