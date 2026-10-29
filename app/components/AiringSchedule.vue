<template>
  <section aria-labelledby="schedule-heading">
    <div class="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div>
        <h2 id="schedule-heading" class="text-2xl font-extrabold text-gray-100 sm:text-3xl">
          Dubs airing this week
        </h2>
        <p class="mt-1 text-xs text-gray-400">
          <template v-if="airing.listUpdated">
            List updated {{ airing.listUpdated }} ·
          </template>
          Checked {{ checkedAgo }}
        </p>
      </div>
      <!-- Large screens can show the whole week at once. -->
      <div
        class="hidden rounded-lg bg-gray-800 p-1 ring-1 ring-gray-700 lg:inline-flex"
        role="group"
        aria-label="Schedule layout"
      >
        <button
          v-for="option in (['day', 'week'] as const)"
          :key="option"
          type="button"
          :aria-pressed="view === option"
          class="rounded-md px-3 py-1 text-sm font-semibold capitalize focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
          :class="view === option ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'"
          @click="setView(option)"
        >
          {{ option === 'day' ? 'One day' : 'Whole week' }}
        </button>
      </div>
    </div>

    <!-- Whole week: one column per day (large screens only). -->
    <div v-if="showWeek" class="grid grid-cols-7 gap-3">
      <div v-for="day in WEEKDAYS" :key="day" class="min-w-0">
        <h3
          class="mb-2 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-base font-bold"
          :class="day === today ? 'bg-gray-800 text-orange-400 ring-1 ring-orange-400/50' : 'bg-gray-800 text-gray-200'"
        >
          {{ day }}
          <span class="text-xs font-semibold opacity-70">{{ airing.days[day].length }}</span>
        </h3>
        <ul class="space-y-3">
          <li v-for="show in airing.days[day]" :key="show.malId">
            <AiringCard :show="show" compact @select="emit('select', $event)" />
          </li>
          <li v-if="!airing.days[day].length" class="py-4 text-center text-yellow-400">
            Nothing 😢
          </li>
        </ul>
      </div>
    </div>

    <template v-else>
      <!-- Weekday tabs: centered, and scroll sideways on phones (safe-center keeps the first tab reachable). -->
      <div
        ref="tablist"
        role="tablist"
        aria-label="Day of the week"
        class="no-scrollbar -mx-4 mb-3 flex justify-center-safe gap-2 overflow-x-auto px-4 py-1.5 sm:mx-0 sm:px-1.5"
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
          class="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
          :class="day === selectedDay
            ? 'bg-blue-600 text-white ring-blue-500'
            : 'bg-gray-800 text-gray-300 ring-gray-600 hover:bg-gray-700'"
          @click="selectDay(day)"
        >
          <span class="sm:hidden">{{ day.slice(0, 3) }}</span>
          <span class="hidden sm:inline">{{ day }}</span>
          <span v-if="day === today" class="text-[0.65rem] tracking-wide uppercase" :class="day === selectedDay ? 'opacity-80' : 'text-orange-400'">today</span>
          <span
            class="rounded-full px-1.5 text-xs"
            :class="day === selectedDay ? 'bg-white/20' : 'bg-gray-700 text-gray-400'"
          >{{ airing.days[day].length }}</span>
        </button>
      </div>

      <div :id="`panel-${selectedDay}`" role="tabpanel" :aria-labelledby="`tab-${selectedDay}`">
        <p v-if="!shows.length" class="rounded-xl bg-gray-800 px-4 py-8 text-center text-yellow-400">
          Nothing 😢
        </p>
        <ul v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          <li v-for="show in shows" :key="show.malId" class="min-w-0">
            <AiringCard :show="show" @select="emit('select', $event)" />
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { WEEKDAYS, type AiringData, type AiringDub, type Weekday } from '#shared/types'

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

// Layout: "week" (default on large screens) or "day". The choice is remembered per browser.
const VIEW_KEY = 'schedule-view'
const view = ref<'day' | 'week'>('week')
const isLarge = ref(false)
const showWeek = computed(() => isLarge.value && view.value === 'week')

function setView(next: 'day' | 'week') {
  view.value = next
  try {
    localStorage.setItem(VIEW_KEY, next)
  }
  catch {
    // Storage can be unavailable (private browsing); the choice just isn't remembered.
  }
}

const tablist = useTemplateRef<HTMLElement>('tablist')
const tabs = useTemplateRef<HTMLButtonElement[]>('tabs')

// Keep the selected tab visible when the tabs scroll sideways on phones.
function scrollTabIntoView(index: number, behavior: ScrollBehavior = 'smooth') {
  const list = tablist.value
  const tab = tabs.value?.[index]
  if (!list || !tab || list.scrollWidth <= list.clientWidth) return
  list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior })
}

function selectDay(day: Weekday) {
  selectedDay.value = day
  scrollTabIntoView(WEEKDAYS.indexOf(day))
}

// Arrow keys move between tabs, as screen reader users expect from a tablist.
function onTabKey(event: KeyboardEvent) {
  const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
  if (!step) return
  event.preventDefault()
  const next = (WEEKDAYS.indexOf(selectedDay.value) + step + WEEKDAYS.length) % WEEKDAYS.length
  selectDay(WEEKDAYS[next]!)
  tabs.value?.[next]?.focus()
}

onMounted(() => {
  try {
    const saved = localStorage.getItem(VIEW_KEY)
    if (saved === 'day' || saved === 'week') view.value = saved
  }
  catch {
    // Use the default.
  }
  const query = window.matchMedia('(min-width: 1024px)')
  const onChange = () => (isLarge.value = query.matches)
  onChange()
  query.addEventListener('change', onChange)
  onBeforeUnmount(() => query.removeEventListener('change', onChange))
  nextTick(() => scrollTabIntoView(WEEKDAYS.indexOf(selectedDay.value), 'instant'))
})
</script>
