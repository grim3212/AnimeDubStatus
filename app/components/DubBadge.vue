<template>
  <span
    class="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset"
    :class="DUB_STATUS[status].badge"
  >
    <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    {{ DUB_STATUS[status].label }}
  </span>
</template>

<script setup lang="ts">
import { DUB_STATUS, type DubStatus } from '~/utils/dub'

defineProps<{ status: DubStatus }>()
</script>
