<template>
  <dialog
    ref="dialog"
    class="m-auto max-h-[92dvh] w-[min(48rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl bg-gray-800 p-0 text-gray-200 shadow-2xl ring-1 ring-gray-600 backdrop:bg-transparent"
    :aria-labelledby="selection ? 'detail-title' : undefined"
    @close="emit('close')"
    @click="onBackdropClick"
  >
    <!-- Outside the scrolling area so it never covers the content. -->
    <button
      v-if="selection"
      type="button"
      class="absolute top-2 right-2 z-10 rounded-full bg-gray-800/80 p-2 text-gray-300 ring-1 ring-gray-600 backdrop-blur hover:bg-gray-700 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
      aria-label="Close"
      @click="close"
    >
      <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>

    <div v-if="selection" class="max-h-[92dvh] overflow-y-auto overscroll-contain">
      <div class="flex flex-col gap-5 px-4 pt-14 pb-6 sm:flex-row sm:px-6 sm:pt-6 sm:pr-14">
        <div class="mx-auto w-40 shrink-0 sm:mx-0 sm:w-52">
          <AnimeCover :src="media?.coverLarge" :title="selection.title" :color="media?.color" />
        </div>

        <div class="min-w-0 flex-1 space-y-3">
          <div>
            <DubBadge :status="status" />
            <h2 id="detail-title" class="mt-2 text-xl font-extrabold break-words text-gray-100 sm:text-2xl">
              {{ media?.title ?? selection.title }}
            </h2>
            <p v-if="media?.romaji && media.romaji !== media.title" class="text-sm break-words text-gray-400">
              {{ media.romaji }}
            </p>
            <p v-if="media?.native" class="text-sm break-words text-gray-500" lang="ja">
              {{ media.native }}
            </p>
            <p class="mt-1 text-sm text-gray-400">
              {{ mediaFacts(media) }}<template v-if="media?.averageScore">
                · {{ media.averageScore }}% on AniList
              </template>
            </p>
          </div>

          <p class="text-lg font-bold" :class="DUB_STATUS[status].text">
            {{ DUB_STATUS[status].answer }}
          </p>

          <dl
            v-if="selection.airing || media?.nextAiringEpisode"
            class="grid gap-x-4 gap-y-1 rounded-xl bg-gray-900/60 p-3 text-sm sm:grid-cols-[auto_1fr]"
          >
            <template v-if="selection.airing">
              <dt class="text-gray-400">
                New dub episodes
              </dt>
              <dd>
                Every {{ airingDay }}<template v-if="dubProgress(selection.airing)">
                  · {{ dubProgress(selection.airing) }} out
                </template>
                <span v-if="selection.airing.suspended" class="font-semibold text-red-300"> · Dub production paused</span>
              </dd>
            </template>
            <template v-if="media?.nextAiringEpisode">
              <dt class="text-gray-400">
                Next episode in Japan
              </dt>
              <dd>
                Ep {{ media.nextAiringEpisode.episode }}:
                {{ formatAiringTime(media.nextAiringEpisode.airingAt) }}
                <span class="text-gray-400">({{ formatRelative(media.nextAiringEpisode.airingAt) }})</span>
              </dd>
            </template>
          </dl>

          <ul v-if="media?.genres.length" class="flex flex-wrap gap-1.5" aria-label="Genres">
            <li v-for="genre in media.genres" :key="genre" class="rounded-md bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
              {{ genre }}
            </li>
          </ul>

          <p v-if="media?.description" class="text-sm leading-relaxed whitespace-pre-line text-gray-300">
            {{ media.description }}
          </p>
          <p v-if="media?.synonyms.length" class="text-xs break-words text-gray-500">
            Also known as: {{ media.synonyms.join(', ') }}
          </p>

          <div class="flex flex-wrap gap-2 pt-1">
            <a
              v-if="selection.malId"
              :href="`https://myanimelist.net/anime/${selection.malId}`"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-lg bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-100 hover:bg-gray-600"
            >MyAnimeList ↗</a>
            <a
              v-if="media"
              :href="media.siteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-lg bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-100 hover:bg-gray-600"
            >AniList ↗</a>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { WEEKDAYS } from '#shared/types'
import { DUB_STATUS, dubProgress, formatAiringTime, formatRelative, mediaFacts, type Selection } from '~/utils/dub'

const props = defineProps<{ selection: Selection | null }>()
const emit = defineEmits<{ close: [] }>()

const { statusOf, airing } = useDubData()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const media = computed(() => props.selection?.media ?? null)
const status = computed(() => statusOf(props.selection?.malId ?? null))
const airingDay = computed(() =>
  WEEKDAYS.find(d => airing.value?.days[d].some(s => s.malId === props.selection?.malId)))

watch(() => props.selection, (selection) => {
  if (selection && !dialog.value?.open) dialog.value?.showModal()
  if (!selection && dialog.value?.open) dialog.value.close()
}, { flush: 'post' })

function close() {
  dialog.value?.close()
}

// A click on the dialog element itself (not its content) is a click on the backdrop.
function onBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) close()
}
</script>
