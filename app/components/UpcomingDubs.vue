<template>
  <section aria-labelledby="upcoming-heading">
    <h2 id="upcoming-heading" class="mb-3 text-2xl font-extrabold text-slate-100 sm:text-3xl">
      Upcoming simuldubs
    </h2>
    <div class="grid gap-4 md:grid-cols-2">
      <div v-for="group in groups" :key="group.season" class="rounded-xl bg-slate-900 p-4 ring-1 ring-slate-800">
        <h3 class="mb-2 font-bold text-sky-300">
          {{ group.season }}
        </h3>
        <ul class="space-y-1.5 text-sm">
          <li v-for="item in group.items" :key="item.title" class="flex items-baseline justify-between gap-3">
            <span class="min-w-0 break-words text-slate-200">{{ item.title }}</span>
            <span class="shrink-0 text-xs whitespace-nowrap" :class="item.confirmed ? 'text-slate-400' : 'text-amber-300/80'">
              {{ item.date ?? (item.confirmed ? 'Date TBA' : 'Unconfirmed') }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { UpcomingGroup } from '#shared/types'

defineProps<{ groups: UpcomingGroup[] }>()
</script>
