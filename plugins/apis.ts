import { get, search } from '@/apis/animes'

export default defineNuxtPlugin(() => {
  const api = {
    anime: { get, search }
  }
  return {
    provide: {
      api
    }
  }
})
