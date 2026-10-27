<template>
  <form role="search" class="relative w-full" @submit.prevent="emit('search', text)">
    <label for="search" class="sr-only">Search for an anime</label>
    <svg
      class="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.2-5.2M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
    </svg>
    <input
      id="search"
      v-model="text"
      type="search"
      inputmode="search"
      enterkeyhint="search"
      autocomplete="off"
      maxlength="100"
      placeholder="Cowboy Bebop..."
      class="w-full rounded-xl border border-gray-600 bg-gray-800 py-3.5 pr-28 pl-12 text-base text-gray-100 placeholder:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
    >
    <button
      type="submit"
      :disabled="loading || !text.trim()"
      class="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none disabled:opacity-60"
    >
      {{ loading ? 'Searching…' : 'Search' }}
    </button>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{ initial: string, loading: boolean }>()
const emit = defineEmits<{ search: [query: string] }>()

const text = ref(props.initial)
// Keep the box in sync when the query changes from the URL (back button, shared link).
watch(() => props.initial, (q) => {
  text.value = q
})
</script>
