import { anilist, SEARCH_QUERY } from '#shared/anilist'
import type { MediaSummary } from '#shared/types'

// Searches go straight from the browser to AniList. The query lives in the URL (?q=) so
// searches can be shared and the back button works.
const cache = new Map<string, MediaSummary[]>()

export function useSearch() {
  const route = useRoute()
  const router = useRouter()
  const results = shallowRef<MediaSummary[]>([])
  const loading = ref(false)
  const error = ref<string>()
  const query = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))

  async function run(q: string) {
    error.value = undefined
    if (!q) {
      results.value = []
      return
    }
    const key = q.toLowerCase()
    const cached = cache.get(key)
    if (cached) {
      results.value = cached
      return
    }
    loading.value = true
    try {
      const found = await anilist(SEARCH_QUERY, { search: q })
      cache.set(key, found)
      // Ignore a slow response if the user has searched for something else since.
      if (query.value === q) results.value = found
    }
    catch (err) {
      console.error(err)
      error.value = err instanceof Error && err.message.includes('rate limiting')
        ? err.message
        : 'Search failed. Check your connection and try again.'
      results.value = []
    }
    finally {
      loading.value = false
    }
  }

  function search(q: string) {
    const trimmed = q.trim().slice(0, 100)
    router.push({ query: trimmed ? { q: trimmed } : {} })
  }

  if (import.meta.client) {
    watch(query, run, { immediate: true })
  }

  return { query, results, loading, error, search }
}
