# Anime Dub Status

Is it dubbed? Search any anime to find out whether it has an English dub, and see which simuldubs
are airing each day this week. https://animedubstatus.com/

## How it works

A static site on a CDN. A scheduled job refreshes the dub data a few times a day from the sources
in [Credits](#credits), and searches go straight from the browser to AniList's public API. There's
no API server or database.

- **Site** (`app/`): a static [Nuxt 4](https://nuxt.com) site (`nuxt generate`) styled with
  Tailwind CSS 4. It loads `/data/*.json` and looks up each search's MAL id in the dub list.
- **Data job** (`jobs/`): rebuilds the JSON data files. If a source looks broken, it throws
  instead of overwriting good data, and repeated failures send an alert.
- **Infrastructure** (`infra/`): AWS CDK.
- **Shared** (`shared/`): the JSON types and the AniList client, used by both the site and the job.

## Development

Needs Node 24.

```bash
npm install
npm run refresh-data   # fetch real data into public/data/ (gitignored)
npm run dev            # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint (`npx eslint . --fix` to fix) |
| `npm run typecheck` | Type-check the site, infra and job |
| `npm test` | Unit tests (the forum parser) |
| `npm run build` | Generate the static site into `.output/public` |

## Deploying

Deployed to AWS with CDK. Pushing to `main` deploys automatically.

## Maintenance notes

- **Dependencies**: Dependabot opens one grouped PR per month. CI checks it, and merging it deploys.
- **If the airing list stops updating**: the forum post's layout probably changed. Check the
  data job's logs, update `jobs/forum.ts` and its test (`jobs/forum.test.ts`), then push.
- **Security headers**: the CDN sends HSTS, X-Frame-Options and so on. The
  Content-Security-Policy is a `<meta>` tag written into each page at build time
  (`infra/lib/csp.ts`) so it can allow Nuxt's inline scripts by hash. Add any new external
  host there.

## Credits

- [`dubInfo.json`](https://github.com/MAL-Dubs/MAL-Dubs/blob/main/data/dubInfo.json) from
  [MAL-Dubs](https://github.com/MAL-Dubs/MAL-Dubs), licensed `AGPL-3.0`.
- The [currently airing dubs list](https://myanimelist.net/forum/?topicid=1692966) on
  MyAnimeList, maintained by [Kenny_Stryker](https://myanimelist.net/profile/Kenny_Stryker).
- Search, cover art and Japanese air times from the [AniList API](https://docs.anilist.co).

Licensed under [AGPL-3.0](LICENSE).
