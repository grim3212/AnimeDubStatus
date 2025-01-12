<template>
  <section class="text-gray-200">
    <div class="mx-auto px-5 py-24 flex flex-col w-full justify-center items-center">
      <div class="max-w-6xl flex flex-wrap w-full mb-20 flex-col items-center text-center">
        <h1
          class="title-font mb-2 text-4xl font-extrabold leading-10 tracking-tight sm:text-5xl sm:leading-none md:text-6xl"
        >
          Anime Dub Status
        </h1>
        <p class="lg:w-1/2 w-full leading-relaxed text-base">
          Find out if an anime has been dubbed or not.
          <span class="text-blue-300">Currently
            <span class="font-semibold underline">{{ dubInfo?.dubbed.length }}</span> dubs</span>
        </p>
      </div>
      <div class="max-w-6xl flex w-full">
        <form class="w-full" @submit.prevent="searchAnime">
          <label
            for="searchInput"
            class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >
            Search
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                aria-hidden="true"
                class="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              id="searchInput"
              v-model="state.search"
              type="search"
              class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Cowboy Bebop..."
              required
            >
            <button
              :disabled="state.loading"
              type="submit"
              class="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <span v-if="!state.loading">Search</span>
              <div v-else role="status">
                <svg
                  aria-hidden="true"
                  class="w-10 h-5 text-gray-100 animate-spin dark:text-gray-200 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span class="sr-only">Loading...</span>
              </div>
            </button>
          </div>
        </form>
      </div>
      <div v-if="state.loading" role="status" class="pt-10">
        <svg
          aria-hidden="true"
          class="w-10 h-10 text-yellow-200 animate-spin dark:text-yellow-400 fill-white"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
      <div
        v-else-if="showAnimeDetails && currentAnime"
        class="flex flex-col justify-center items-center w-full"
      >
        <div class="max-w-6xl relative text-center w-full">
          <span
            id="isDubbedText"
            class="text-amber-300 title-font mb-2 text-4xl font-extrabold leading-10 tracking-tight sm:text-6xl sm:leading-none md:text-8xl"
          >
            {{ dubText(currentAnime.mal_id) }}
          </span>
          <div class="absolute top-0 right-0">
            <button
              type="button"
              class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 my-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
              @click.prevent="searchOptionsOpen = true"
            >
              Not What I'm Looking For
            </button>
          </div>
        </div>
        <div
          id="animeDetails"
          class="max-w-7xl text-blue-100 title-font mb-2 text-xl leading-10 tracking-tight sm:text-2xl sm:leading-none md:text-4xl flex flex-col"
        >
          <span class="text-center"><a
            id="animeTitle"
            class="underline"
            :href="`https://myanimelist.net/anime/${currentAnime.mal_id}`"
          >
            {{ currentAnime.title }}
          </a></span>
          <hr class="my-4">
          <div class="flex sm:flex-row flex-col justify-center w-full text-lg">
            <div class="pr-6 flex flex-col">
              <div
                v-if="
                  currentAnime.title_english ||
                    currentAnime.title_japanese ||
                    currentAnime.title_synonyms?.length
                "
                class="flex flex-col"
              >
                <h3 class="text-lg font-bold italic">
                  Alternative Titles:
                </h3>
                <span v-if="currentAnime.title_english">
                  <span class="font-semibold">English</span>:
                  {{ currentAnime.title_english }}
                </span>
                <span v-if="currentAnime.title_japanese">
                  <span class="font-semibold">Japanese</span>:
                  {{ currentAnime.title_japanese }}
                </span>

                <span v-if="currentAnime.title_synonyms?.length">
                  <span class="font-semibold">Synonyms</span>:
                  {{ currentAnime.title_synonyms.join(', ') }}
                </span>
              </div>

              <br>
              <span id="animeSynopsis">{{ currentAnime.synopsis }}</span>
            </div>

            <img id="animeImg" class="object-contain" :src="getLargeImage(currentAnime)">
          </div>
        </div>
      </div>
      <div v-else-if="showAnimeDetails">
        <span
          id="animeNotFound"
          class="text-amber-300 title-font mb-2 text-4xl font-extrabold leading-10 tracking-tight sm:text-6xl sm:leading-none md:text-8xl"
        >
          Could not Find Anime
        </span>
      </div>

      <div v-if="currentlyAiring && localCache.length" id="currentlyAiring">
        <h1 class="lg:text-4xl text-6xl text-center text-orange-400">
          Currently Airing
        </h1>
        <div class="grid grid-cols-1 lg:grid-cols-7 gap-4 w-full rounded text-center">
          <div v-for="day of days" :id="day.toLowerCase()" :key="day" class="flex flex-col">
            <h2 class="font-bold lg:text-xl lg:m-2 m-4 text-6xl">
              {{ day }}
            </h2>

            <template v-if="currentlyAiring[day as keyof CurrentlyAiringList].length">
              <AiringAnime
                v-for="anime of currentlyAiring[day as keyof CurrentlyAiringList]"
                :key="anime.mal_id"
                :airing-details="anime"
                :anime="fullAnimeFromAiring(anime)"
                @select-anime="selectAnime"
              />
            </template>
            <div v-else class="text-yellow-400">
              Nothing 😢
            </div>
          </div>
        </div>
      </div>
      <SearchOptions
        v-if="searchOptionsOpen"
        :animes="state.animes"
        :current-id="currentId"
        @hide="searchOptionsOpen = false"
        @select-anime="selectAnime"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  CurrentlyAiringList,
  DubCurrentlyAiring,
  DubInfo,
  DubMatch,
  FullAnime,
  SearchState,
} from '@/types'

const { $api } = useNuxtApp()

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const state: SearchState = reactive({
  search: '',
  animes: [],
  loading: false,
})

const showAnimeDetails = ref(false)
const searchOptionsOpen = ref(false)
const dubInfo = ref<DubInfo>()
const currentlyAiring = ref<CurrentlyAiringList>()
const currentId = ref(0)
const currentAnime = ref<FullAnime>()
// In case they try to retrieve details on an anime we already have details on
const localCache = ref<FullAnime[]>([])

onMounted(async() => {
  const dubInfoResponse = await fetch('/dubInfo.json')
  dubInfo.value = await dubInfoResponse.json()

  const currentlyAiringResponse = await fetch('/currentlyAiring.json')
  currentlyAiring.value = await currentlyAiringResponse.json()

  if (currentlyAiring.value) {
    let key: keyof CurrentlyAiringList
    for (key in currentlyAiring.value) {
      const entries: DubCurrentlyAiring[] = currentlyAiring.value[key]
      for (const anime of entries) {
        localCache.value.push(anime.details)
      }
    }
  }
})

watch(currentId, async(newId, oldId) => {
  if (newId !== oldId && newId > 0) {
    const cacheIdx = localCache.value.findIndex(x => x.mal_id === newId)
    if (cacheIdx > -1) {
      currentAnime.value = localCache.value[cacheIdx]
    } else {
      const anime = await $api.anime.get(newId)
      if (anime) {
        localCache.value.push(anime)
        if (currentAnime.value) {
          currentAnime.value = {
            ...anime,
          }
        }
      }
    }
  }
})

const dubbedAnimeIds = computed(() => dubInfo.value?.dubbed ?? [])
const incompleteAnimeIds = computed(() => dubInfo.value?.incomplete ?? [])
const currentlyAiringAnimeIds = computed(() => {
  const ids: number[] = []
  if (!currentlyAiring.value) {
    return ids
  }

  let key: keyof CurrentlyAiringList
  for (key in currentlyAiring.value) {
    const entries: DubCurrentlyAiring[] = currentlyAiring.value[key]
    for (const anime of entries) {
      ids.push(anime.mal_id)
    }
  }
  return ids
})

function fullAnimeFromAiring(airing: DubCurrentlyAiring): FullAnime {
  const anime = localCache.value.find(x => x.mal_id === airing.mal_id)
  if (!anime) {
    throw new Error('Failed to find locally cached anime')
  }
  return anime
}

async function searchAnime() {
  state.loading = true
  console.log('Searching for anime...', state.search)
  state.animes = []

  const searchAnime = await $api.anime.search(state.search)
  if (searchAnime) {
    if (searchAnime.length) {
      state.animes = searchAnime
      currentId.value = state.animes[0].mal_id
      currentAnime.value = {
        ...state.animes[0],
      }
    }

    state.loading = false
    showAnimeDetails.value = true
  } else {
    state.animes = []
    state.loading = false
    showAnimeDetails.value = true
  }
}

function doesIdMatch(id: number): DubMatch {
  if (dubbedAnimeIds.value.includes(id)) {
    if (currentlyAiringAnimeIds.value.includes(id)) {
      return DubMatch.CurrentlyAiring
    }
    return DubMatch.Dubbed
  } else if (incompleteAnimeIds.value.includes(id)) {
    return DubMatch.InComplete
  }
  return DubMatch.None
}

function dubText(id: number): string {
  const dubMatch = doesIdMatch(id)
  if (dubMatch === DubMatch.Dubbed) {
    return "It's Dubbed"
  } else if (dubMatch === DubMatch.CurrentlyAiring) {
    return 'Dub Currently Airing'
  } else if (dubMatch === DubMatch.InComplete) {
    return 'Incomplete'
  }
  return 'Not Dubbed'
}

function selectAnime(newId: number, scroll = false) {
  currentId.value = newId
  searchOptionsOpen.value = false
  showAnimeDetails.value = true

  if (scroll) {
    scrollToTop()
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
