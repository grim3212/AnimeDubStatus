<template>
  <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-gray-700 bg-opacity-75 transition-opacity" />

    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div
        class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        @click.self="hide()"
      >
        <div
          class="relative transform overflow-hidden rounded-lg bg-slate-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl"
        >
          <div class="bg-slate-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10"
              >
                <svg
                  width="800px"
                  height="800px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="Complete">
                    <g id="info-circle">
                      <g>
                        <circle
                          id="_--Circle"
                          cx="12"
                          cy="12"
                          data-name="--Circle"
                          fill="none"
                          r="10"
                          stroke="#000000"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                        />

                        <line
                          fill="none"
                          stroke="#000000"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          x1="12"
                          x2="12"
                          y1="12"
                          y2="16"
                        />

                        <line
                          fill="none"
                          stroke="#000000"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          x1="12"
                          x2="12"
                          y1="8"
                          y2="8"
                        />
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 id="modal-title" class="text-base font-semibold leading-6 text-blue-600">
                  Not What I'm Looking For
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    If the anime was not the one you were looking for check the list here. Click on
                    the anime's name below to check if that anime is dubbed.
                  </p>
                </div>
                <br>
                <div class="mt-2">
                  <ul class="list-disc list-inside">
                    <li
                      v-for="anime of animeOptions"
                      :key="anime.mal_id"
                      class="text-orange-400 text-lg"
                    >
                      <span
                        class="text-white-400 cursor-pointer"
                        @click="selectAnime(anime.mal_id)"
                      >
                        {{ anime.title }}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-slate-950 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-slate-500 px-3 py-2 text-sm font-semibold text-white-500 shadow-sm ring-1 ring-inset ring-slate-400 hover:bg-slate-600 sm:mt-0 sm:w-auto"
              @click="hide()"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Anime } from '@/types'

const emit = defineEmits(['hide', 'selectAnime'])
const props = defineProps<{
  animes: Anime[]
  currentId: number
}>()

const animeOptions = computed(() => {
  if (!props.animes.length) {
    return []
  }

  const remaining = props.animes.filter(x => x.mal_id !== props.currentId)
  return remaining
})

function hide() {
  emit('hide')
}

function selectAnime(newId: number) {
  emit('selectAnime', newId)
}
</script>
