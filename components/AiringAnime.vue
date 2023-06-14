<template>
  <div class="p-2 bg-slate-600 rounded-lg mb-2">
    <div
      :id="`anime-${props.anime.mal_id}`"
      class="h-60 md:h-96 lg:h-60 xl:h-80 group/container relative"
    >
      <img
        class="my-0 opacity-70 group-hover/container:opacity-100 object-cover max-h-full max-w-full h-auto w-auto cursor-pointer"
        :src="props.anime.image_url"
        @click.stop="selectAnime(props.anime.mal_id)"
      >
      <div
        class="flex flex-col p-2 absolute bottom-0 bg-slate-800/80 w-full group-hover/container:bg-slate-800/90 rounded-lg"
      >
        <span>
          <a
            class="font-bold text-blue-500 underline hover:text-blue-600 visited:text-purple-400"
            :href="props.anime.url"
          >{{ props.anime.title_english ?? props.anime.title }}</a>
        </span>

        <div class="text-sm">
          <span v-for="(episode, idx) of props.airingDetails.episodes" :key="idx">
            <span v-for="[key, value] of Object.entries(episode)" :key="key">
              <span class="italic">{{ key }}</span>: {{ value.current }} / {{ value.total }}
              <br>
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DubCurrentlyAiring, FullAnime } from '@/types'
const props = defineProps<{
  airingDetails: DubCurrentlyAiring
  anime: FullAnime
}>()

const emit = defineEmits(['selectAnime'])
function selectAnime(newId: number) {
  emit('selectAnime', newId, true)
}
</script>
