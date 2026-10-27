# Anime Dub Status

Is it dubbed? Search any anime to find out whether it has an English dub, and see which simuldubs
are airing each day this week. https://animedubstatus.com/

## How it works

```
                       every 6 hours
EventBridge ──────────────▶ Lambda: animedubstatus-refresh-data (jobs/refresh-data.ts)
                              │  MAL-Dubs dubInfo.json ─┐
                              │  MAL forum airing list ─┼─▶ S3: data/dub-info.json
                              │  AniList (details) ─────┘       data/airing.json
                              ▼
Browser ──▶ Cloudflare DNS ──▶ CloudFront ──▶ S3 (animedubstatus-com): the static Nuxt site + data/
   │
   └──▶ AniList GraphQL API (searches go straight from the browser)
```

- **Site** (`app/`): a static [Nuxt 4](https://nuxt.com) site (`nuxt generate`) styled with
  Tailwind CSS 4. It loads `/data/*.json` and looks up each search's MAL id in the dub list.
- **Data job** (`jobs/`): one Node Lambda that rebuilds the two JSON files. If a source looks
  broken, it throws instead of overwriting good data, and (with `alertEmail` set) two failures
  in a row send an email.
- **Infrastructure** (`infra/`): one AWS CDK stack in us-west-2 that creates the bucket, CloudFront,
  the Lambda, its schedule and the alarm.
- **Shared** (`shared/`): the JSON types and the AniList client, used by both the site and the job.

There is no API server or database. Searches use [AniList](https://anilist.co)'s public API from
the browser.

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

Pushing to `main` deploys automatically (`.github/workflows/deploy.yml`). The workflow does a
**full** deploy (CDK + site + data refresh) when `infra/`, `jobs/`, `shared/`, the deploy script,
the workflow or dependencies changed, and otherwise a **web** deploy (upload the site only). You
can also run it by hand from the Actions tab (web, full or refresh-data).

GitHub signs in to AWS over OIDC with a role that only trusts the `main` branch of this repo, so
no AWS keys are stored in GitHub. Pull requests run `.github/workflows/ci.yml`, which has no AWS
access or secrets.

Deploying from your own machine needs AWS access and an `infra/config.json` (see
`infra/config.example.json`):

```bash
npm run deploy       # full: cdk deploy, upload the site, refresh the data
npm run deploy:web   # just upload the site
npm run diff         # preview infrastructure changes
```

## Maintenance notes

- **Dependencies**: Dependabot opens one grouped PR per month. CI checks it, and merging it deploys.
- **If the airing list stops updating**: the forum post's layout probably changed. Check the
  Lambda's logs, update `jobs/forum.ts` and its test (`jobs/forum.test.ts`), then push.
- **Security headers**: CloudFront sends HSTS, X-Frame-Options and so on. The
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
