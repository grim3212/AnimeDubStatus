// AniList GraphQL API (https://docs.anilist.co). Used by the daily job and by the browser for
// searches. It needs no key and allows CORS; the limit is ~30-90 requests/minute per IP.
import type { MediaSummary } from './types'

export const ANILIST_URL = 'https://graphql.anilist.co'

const MEDIA_FIELDS = `
  id idMal title { romaji english native } synonyms format status episodes season seasonYear
  averageScore genres description(asHtml: false) siteUrl
  coverImage { large extraLarge color } nextAiringEpisode { episode airingAt }
`

export const SEARCH_QUERY = `query ($search: String) {
  Page(perPage: 15) { media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) { ${MEDIA_FIELDS} } }
}`

export const BY_MAL_IDS_QUERY = `query ($ids: [Int]) {
  Page(perPage: 50) { media(idMal_in: $ids, type: ANIME) { ${MEDIA_FIELDS} } }
}`

interface RawMedia {
  id: number
  idMal: number | null
  title: { romaji: string | null, english: string | null, native: string | null }
  synonyms: string[] | null
  format: string | null
  status: string | null
  episodes: number | null
  season: string | null
  seasonYear: number | null
  averageScore: number | null
  genres: string[] | null
  description: string | null
  siteUrl: string
  coverImage: { large: string | null, extraLarge: string | null, color: string | null } | null
  nextAiringEpisode: { episode: number, airingAt: number } | null
}

export async function anilist(query: string, variables: Record<string, unknown>, fetchImpl = fetch) {
  const res = await fetchImpl(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (res.status === 429) throw new Error('AniList is rate limiting requests. Try again in a minute.')
  if (!res.ok) throw new Error(`AniList returned HTTP ${res.status}`)
  const body = await res.json() as { data?: { Page: { media: RawMedia[] } }, errors?: { message: string }[] }
  if (body.errors?.length || !body.data) {
    throw new Error(`AniList error: ${body.errors?.map(e => e.message).join('; ') ?? 'no data'}`)
  }
  return body.data.Page.media.map(toSummary)
}

/** AniList descriptions contain <br>, <i> and the like even with asHtml: false. Keep plain text. */
export function plainText(html: string | null): string | null {
  if (!html) return null
  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, '\'')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&mdash;/g, '—')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return text || null
}

const httpsOrNull = (url: string | null | undefined) => (url?.startsWith('https://') ? url : null)

export function toSummary(m: RawMedia): MediaSummary {
  return {
    anilistId: m.id,
    malId: m.idMal,
    title: m.title.english || m.title.romaji || m.title.native || 'Untitled',
    romaji: m.title.romaji || m.title.english || '',
    native: m.title.native,
    synonyms: m.synonyms ?? [],
    format: m.format,
    status: m.status,
    episodes: m.episodes,
    season: m.season,
    seasonYear: m.seasonYear,
    averageScore: m.averageScore,
    genres: m.genres ?? [],
    description: plainText(m.description),
    cover: httpsOrNull(m.coverImage?.large ?? m.coverImage?.extraLarge),
    coverLarge: httpsOrNull(m.coverImage?.extraLarge ?? m.coverImage?.large),
    color: m.coverImage?.color && /^#[0-9a-f]{6}$/i.test(m.coverImage.color) ? m.coverImage.color : null,
    siteUrl: httpsOrNull(m.siteUrl) ?? `https://anilist.co/anime/${m.id}`,
    nextAiringEpisode: m.nextAiringEpisode,
  }
}
