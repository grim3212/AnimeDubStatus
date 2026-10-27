<template>
  <div
    class="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-slate-800"
    :style="color ? { backgroundColor: `${color}33` } : undefined"
  >
    <img
      v-if="src && !failed"
      :src="src"
      :alt="`Cover art for ${title}`"
      class="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      referrerpolicy="no-referrer"
      width="230"
      height="345"
      @error="failed = true"
    >
    <div
      v-else
      class="flex h-full w-full items-center justify-center p-3 text-center text-sm font-semibold text-slate-400"
      aria-hidden="true"
    >
      {{ title }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  src: string | null | undefined
  title: string
  color?: string | null
}>()

// Show the title instead of a broken image if the cover fails to load.
const failed = ref(false)
watch(() => props.src, () => {
  failed.value = false
})
</script>
