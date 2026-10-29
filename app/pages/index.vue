<template>
  <div class="mx-auto w-full max-w-6xl px-4 pt-10 sm:pt-16">
    <header class="mx-auto max-w-2xl text-center">
      <h1 class="text-4xl font-extrabold tracking-tight text-gray-200 sm:text-5xl md:text-6xl">
        <NuxtLink to="/" class="hover:text-white">
          Anime Dub Status
        </NuxtLink>
      </h1>
      <p class="mt-3 leading-relaxed text-gray-200">
        Find out if an anime has been dubbed or not.
        <span v-if="dubInfo" class="text-blue-300">
          Currently <span class="font-semibold underline">{{ dubInfo.dubbed.length.toLocaleString() }}</span> dubs
        </span>
      </p>
      <div class="mt-6">
        <SearchForm :initial="query" :loading="loading" @search="search" />
      </div>
    </header>

    <p v-if="dataError" class="mx-auto mt-6 max-w-2xl rounded-lg bg-red-500/10 px-4 py-3 text-center text-red-200 ring-1 ring-red-400/30">
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
        <div class="h-8 w-64 animate-pulse rounded bg-gray-700" />
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <div v-for="n in 5" :key="n" class="aspect-[2/3] animate-pulse rounded-xl bg-gray-800" />
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
