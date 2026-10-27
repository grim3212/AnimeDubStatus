<template>
  <section aria-labelledby="schedule-heading">
    <div class="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
      <h2 id="schedule-heading" class="text-2xl font-extrabold text-slate-100 sm:text-3xl">
        Dubs airing this week
      </h2>
      <p class="text-xs text-slate-400">
        <template v-if="airing.listUpdated">
          List updated {{ airing.listUpdated }} ·
        </template>
        Checked {{ checkedAgo }}
      </p>
    </div>

    <!-- Weekday tabs: scroll sideways on phones. -->
    <div
      role="tablist"
      aria-label="Day of the week"
      class="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      @keydown="onTabKey"
    >
      <button
        v-for="day in WEEKDAYS"
        :id="`tab-${day}`"
        :key="day"
        ref="tabs"
        role="tab"
        type="button"
        :aria-selected="day === selectedDay"
        :aria-controls="`panel-${day}`"
        :tabindex="day === selectedDay ? 0 : -1"
        class="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none"
        :class="day === selectedDay
          ? 'bg-sky-500 text-slate-950 ring-sky-400'
          : 'bg-slate-900 text-slate-300 ring-slate-700 hover:bg-slate-800'"
        @click="selectedDay = day"
      >
        <span class="sm:hidden">{{ day.slice(0, 3) }}</span>
        <span class="hidden sm:inline">{{ day }}</span>
        <span v-if="day === today" class="text-[0.65rem] tracking-wide uppercase opacity-80">today</span>
        <span
          class="rounded-full px-1.5 text-xs"
          :class="day === selectedDay ? 'bg-slate-950/20' : 'bg-slate-800 text-slate-400'"
        >{{ airing.days[day].length }}</span>
      </button>
    </div>

    <div
      :id="`panel-${selectedDay}`"
      role="tabpanel"
      :aria-labelledby="`tab-${selectedDay}`"
    >
      <p v-if="!shows.length" class="rounded-xl bg-slate-900 px-4 py-8 text-center text-slate-400">
        No dubs airing on {{ selectedDay }}.
      </p>
      <ul v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
        <li v-for="show in shows" :key="show.malId" class="min-w-0">
          <button
            type="button"
            class="group flex h-full w-full flex-col overflow-hidden rounded-xl bg-slate-900 text-left ring-1 ring-slate-800 transition hover:ring-sky-500/60 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
            @click="emit('select', show)"
          >
            <div class="relative">
              <AnimeCover
                :src="show.media?.cover"
                :title="show.title"
                :color="show.media?.color"
              />
              <span
                v-if="show.suspended"
                class="absolute top-2 left-2 rounded-md bg-rose-600/90 px-1.5 py-0.5 text-[0.7rem] font-bold text-white"
              >Dub paused</span>
            </div>
            <div class="flex flex-1 flex-col gap-1.5 p-2.5">
              <p class="line-clamp-2 text-sm leading-snug font-semibold break-words text-slate-100" :title="show.title">
                {{ show.title }}
              </p>
              <div class="mt-auto space-y-1">
                <div v-if="dubProgress(show)" class="flex items-center justify-between text-xs text-slate-300">
                  <span>Dub {{ dubProgress(show) }}</span>
                </div>
                <div
                  v-if="show.dubbedEpisodes && show.totalEpisodes"
                  class="h-1 overflow-hidden rounded-full bg-slate-800"
                  aria-hidden="true"
                >
                  <div
                    class="h-full rounded-full bg-sky-400"
                    :style="{ width: `${Math.min(100, (show.dubbedEpisodes / show.totalEpisodes) * 100)}%` }"
                  />
                </div>
                <p v-if="show.media?.nextAiringEpisode" class="text-[0.7rem] text-slate-400">
                  JP ep {{ show.media.nextAiringEpisode.episode }}:
                  {{ formatAiringTime(show.media.nextAiringEpisode.airingAt) }}
                </p>
              </div>
            </div>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { WEEKDAYS, type AiringData, type AiringDub, type Weekday } from '#shared/types'
import { dubProgress, formatAiringTime } from '~/utils/dub'

const props = defineProps<{ airing: AiringData }>()
const emit = defineEmits<{ select: [show: AiringDub] }>()

// getDay(): 0 = Sunday. WEEKDAYS starts on Monday.
const today = WEEKDAYS[(new Date().getDay() + 6) % 7]!
const selectedDay = ref<Weekday>(today)
const shows = computed(() => props.airing.days[selectedDay.value])

const checkedAgo = computed(() => {
  const hours = Math.round((Date.now() - Date.parse(props.airing.generatedAt)) / 3_600_000)
  return hours < 1 ? 'just now' : hours < 48 ? `${hours}h ago` : `${Math.round(hours / 24)} days ago`
})

// Arrow keys move between tabs, as screen reader users expect from a tablist.
const tabs = useTemplateRef<HTMLButtonElement[]>('tabs')
function onTabKey(event: KeyboardEvent) {
  const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
  if (!step) return
  event.preventDefault()
  const next = (WEEKDAYS.indexOf(selectedDay.value) + step + WEEKDAYS.length) % WEEKDAYS.length
  selectedDay.value = WEEKDAYS[next]!
  tabs.value?.[next]?.focus()
}
</script>
