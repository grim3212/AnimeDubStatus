import { WEEKDAYS, type AiringData, type DubInfo } from '#shared/types'
import type { DubStatus } from '~/utils/dub'

// Loaded once per visit and shared by every component. Both files are written by
// jobs/refresh-data.ts; locally, `npm run refresh-data` creates them in public/data/.
const dubInfo = shallowRef<DubInfo>()
const airing = shallowRef<AiringData>()
const error = ref<string>()
let loading: Promise<void> | undefined

export function useDubData() {
  if (import.meta.client && !loading) {
    loading = Promise.all([
      $fetch<DubInfo>('/data/dub-info.json'),
      $fetch<AiringData>('/data/airing.json'),
    ]).then(([info, air]) => {
      dubInfo.value = info
      airing.value = air
    }).catch((err) => {
      console.error(err)
      error.value = 'Couldn\'t load the dub list. Please refresh to try again.'
      loading = undefined
    })
  }

  const dubbed = computed(() => new Set(dubInfo.value?.dubbed))
  const incomplete = computed(() => new Set(dubInfo.value?.incomplete))
  const airingIds = computed(() => new Set(
    airing.value ? WEEKDAYS.flatMap(d => airing.value!.days[d].map(s => s.malId)) : [],
  ))

  function statusOf(malId: number | null): DubStatus {
    if (!malId) return 'unknown'
    if (airingIds.value.has(malId)) return 'airing'
    if (dubbed.value.has(malId)) return 'dubbed'
    if (incomplete.value.has(malId)) return 'partial'
    return 'none'
  }

  return {
    dubInfo,
    airing,
    error,
    ready: computed(() => Boolean(dubInfo.value && airing.value)),
    statusOf,
  }
}
