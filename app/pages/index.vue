<template>
  <div class="mx-auto w-full max-w-6xl px-4 pt-10 sm:pt-16">
    <header class="mx-auto max-w-2xl text-center">
      <h1 class="text-4xl font-extrabold tracking-tight text-slate-50 sm:text-6xl">
        <NuxtLink to="/" class="hover:text-sky-200">
          Anime Dub Status
        </NuxtLink>
      </h1>
      <p class="mt-3 text-slate-300 sm:text-lg">
        Is it dubbed? Search any anime to find out.
        <span v-if="dubInfo" class="block text-sm text-sky-300 sm:inline">
          Tracking {{ dubInfo.dubbed.length.toLocaleString() }} English dubs.
        </span>
      </p>
      <div class="mt-6">
        <SearchForm :initial="query" :loading="loading" @search="search" />
      </div>
    </header>

    <p v-if="dataError" class="mx-auto mt-6 max-w-2xl rounded-lg bg-rose-500/10 px-4 py-3 text-center text-rose-200 ring-1 ring-rose-400/30">
      {{ dataError }}
    </p>

    <div v-if="query" class="mx-auto mt-6 max-w-3xl">
      <SearchResults
        :query="query"
        :results="results"
        :loading="loading || !ready"
        :error="searchError"
        @select="selectMedia"
      />
    </div>

    <div class="mt-14 space-y-14">
      <AiringSchedule v-if="airing" :airing="airing" @select="selectAiring" />
      <div v-else-if="!dataError" class="space-y-3" aria-hidden="true">
        <div class="h-8 w-64 animate-pulse rounded bg-slate-800" />
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <div v-for="n in 5" :key="n" class="aspect-[2/3] animate-pulse rounded-xl bg-slate-900" />
        </div>
      </div>
      <UpcomingDubs v-if="airing?.upcoming.length" :groups="airing.upcoming" />
    </div>

    <AnimeDetail :selection="selected" @close="selected = null" />
  </div>
</template>

<script setup lang="ts">
import type { AiringDub, MediaSummary } from '#shared/types'
import type { Selection } from '~/utils/dub'

const { dubInfo, airing, error: dataError, ready } = useDubData()
const { query, results, loading, error: searchError, search } = useSearch()

const selected = shallowRef<Selection | null>(null)

function selectMedia(media: MediaSummary) {
  selected.value = { malId: media.malId, title: media.title, media }
}

function selectAiring(show: AiringDub) {
  selected.value = { malId: show.malId, title: show.title, media: show.media, airing: show }
}

useHead({
  title: () => (query.value ? `Is ${query.value} dubbed? · Anime Dub Status` : 'Anime Dub Status: is it dubbed?'),
})
</script>
