<template>
  <button
    type="button"
    class="group relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-gray-800 text-left ring-1 ring-gray-700 transition duration-200 hover:z-10 hover:ring-blue-500/60 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none motion-safe:hover:scale-[1.03] motion-safe:hover:shadow-xl motion-safe:hover:shadow-black/40"
    @click="emit('select', show)"
  >
    <div class="relative">
      <AnimeCover :src="show.media?.cover" :title="show.title" :color="show.media?.color" />
      <span
        v-if="show.suspended"
        class="absolute top-2 left-2 rounded-md bg-red-600/90 px-1.5 py-0.5 text-[0.7rem] font-bold text-white"
      >Dub paused</span>
    </div>
    <div class="flex flex-1 flex-col gap-1.5" :class="compact ? 'p-2' : 'p-2.5'">
      <p
        class="line-clamp-2 min-h-[2lh] leading-snug font-semibold break-words text-gray-100"
        :class="compact ? 'text-xs' : 'text-sm'"
        :title="show.title"
      >
        {{ show.title }}
      </p>
      <!-- Rows a show doesn't have stay as blank space so every card is the same height. -->
      <div class="mt-auto space-y-1">
        <p class="truncate text-xs text-gray-300">
          {{ dubProgress(show) ? `Dub ${dubProgress(show)}` : ' ' }}
        </p>
        <div
          class="h-1 overflow-hidden rounded-full bg-gray-700"
          :class="{ invisible: !(show.dubbedEpisodes && show.totalEpisodes) }"
          aria-hidden="true"
        >
          <div
            class="h-full rounded-full bg-blue-400"
            :style="{ width: `${Math.min(100, ((show.dubbedEpisodes ?? 0) / (show.totalEpisodes || 1)) * 100)}%` }"
          />
        </div>
        <p class="truncate text-[0.7rem] text-gray-400">
          <template v-if="show.media?.nextAiringEpisode">
            JP ep {{ show.media.nextAiringEpisode.episode }}:
            {{ formatAiringTime(show.media.nextAiringEpisode.airingAt) }}
          </template>
          <template v-else>
            &nbsp;
          </template>
        </p>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { AiringDub } from '#shared/types'
import { dubProgress, formatAiringTime } from '~/utils/dub'

defineProps<{ show: AiringDub, compact?: boolean }>()
const emit = defineEmits<{ select: [show: AiringDub] }>()
</script>
