<template>
  <section aria-live="polite" class="space-y-4">
    <p v-if="error" class="rounded-lg bg-rose-500/10 px-4 py-3 text-rose-200 ring-1 ring-rose-400/30">
      {{ error }}
    </p>
    <div v-else-if="loading" class="flex justify-center py-10" role="status">
      <span class="size-8 animate-spin rounded-full border-4 border-slate-700 border-t-sky-400" />
      <span class="sr-only">Searching…</span>
    </div>
    <p v-else-if="!results.length" class="rounded-lg bg-slate-900 px-4 py-6 text-center text-slate-300">
      No anime found for “{{ query }}”. Try the English or Japanese title.
    </p>
    <template v-else-if="top">
      <!-- The best match answers the question directly. -->
      <article class="overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800">
        <div class="flex gap-4 p-4 sm:gap-6 sm:p-6">
          <button
            type="button"
            class="w-24 shrink-0 sm:w-36"
            :aria-label="`More about ${top.title}`"
            @click="emit('select', top)"
          >
            <AnimeCover :src="top.cover" :title="top.title" :color="top.color" />
          </button>
          <div class="min-w-0 flex-1">
            <p class="text-xl font-extrabold sm:text-3xl" :class="DUB_STATUS[statusOf(top.malId)].text">
              {{ DUB_STATUS[statusOf(top.malId)].answer }}
            </p>
            <h2 class="mt-2 text-lg font-bold break-words text-slate-100 sm:text-xl">
              {{ top.title }}
            </h2>
            <p v-if="top.romaji && top.romaji !== top.title" class="text-sm break-words text-slate-400">
              {{ top.romaji }}
            </p>
            <p class="mt-1 text-sm text-slate-400">
              {{ mediaFacts(top) }}
            </p>
            <p v-if="top.description" class="mt-3 line-clamp-3 text-sm text-slate-300 sm:line-clamp-4">
              {{ top.description }}
            </p>
            <button
              type="button"
              class="mt-3 text-sm font-semibold text-sky-300 hover:text-sky-200"
              @click="emit('select', top)"
            >
              More details →
            </button>
          </div>
        </div>
      </article>

      <div v-if="others.length">
        <h3 class="mb-2 text-sm font-semibold tracking-wide text-slate-400 uppercase">
          Not it? Other matches
        </h3>
        <ul class="divide-y divide-slate-800 overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800">
          <li v-for="media in others" :key="media.anilistId">
            <button
              type="button"
              class="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-800/70 focus-visible:bg-slate-800 focus-visible:outline-none"
              @click="emit('select', media)"
            >
              <div class="w-10 shrink-0">
                <AnimeCover :src="media.cover" :title="media.title" :color="media.color" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="line-clamp-2 font-medium break-words text-slate-100">
                  {{ media.title }}
                </p>
                <p class="truncate text-xs text-slate-400">
                  {{ mediaFacts(media) }}
                </p>
              </div>
              <DubBadge :status="statusOf(media.malId)" />
            </button>
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { MediaSummary } from '#shared/types'
import { DUB_STATUS, mediaFacts } from '~/utils/dub'

const props = defineProps<{
  query: string
  results: MediaSummary[]
  loading: boolean
  error?: string
}>()
const emit = defineEmits<{ select: [media: MediaSummary] }>()

const { statusOf } = useDubData()
const top = computed(() => props.results[0])
const others = computed(() => props.results.slice(1))
</script>
