<template>
  <footer class="mt-16 border-t border-slate-800 bg-slate-900/60 px-4 py-8 text-center text-xs leading-relaxed text-slate-400">
    <div class="mx-auto max-w-3xl space-y-2">
      <p class="text-sm text-slate-300">
        &copy; 2023–{{ year }} Dakota Pierone (Grim3212). Built with
        <a :class="link" href="https://nuxt.com/" target="_blank" rel="noopener noreferrer">Nuxt</a>.
      </p>
      <p>
        Licensed under <a :class="link" href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer">AGPL-3.0</a>.
        <a :class="link" href="https://github.com/grim3212/AnimeDubStatus" target="_blank" rel="noopener noreferrer">Source code on GitHub</a>.
      </p>
      <p>
        Dub list: <b>dubInfo.json</b> from
        <a :class="link" href="https://github.com/MAL-Dubs/MAL-Dubs" target="_blank" rel="noopener noreferrer">MAL-Dubs</a>
        (AGPL-3.0). Airing simuldubs: the
        <a :class="link" href="https://myanimelist.net/forum/?topicid=1692966" target="_blank" rel="noopener noreferrer">Upcoming Dubbed Anime</a>
        list maintained by
        <a :class="link" href="https://myanimelist.net/profile/Kenny_Stryker" target="_blank" rel="noopener noreferrer">Kenny_Stryker</a>
        on MyAnimeList.
      </p>
      <p>
        Search, cover art and Japanese air times from
        <a :class="link" href="https://anilist.co/" target="_blank" rel="noopener noreferrer">AniList</a>.
        Not affiliated with MyAnimeList or AniList.
      </p>
      <p class="flex justify-center gap-4 pt-2">
        <a :class="link" href="https://github.com/grim3212" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a :class="link" href="https://twitter.com/grim3212" target="_blank" rel="noopener noreferrer">Twitter</a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
const link = 'font-semibold text-slate-300 underline decoration-slate-600 underline-offset-2 hover:text-sky-300'
</script>
