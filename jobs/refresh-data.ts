// Scheduled Lambda (see infra/lib/site-stack.ts). Builds the two JSON files the site reads and
// writes them to the site bucket under data/:
//   data/dub-info.json  MAL-Dubs' list of dubbed MAL ids (AGPL-3.0, copied unchanged)
//   data/airing.json    this week's simuldubs from the MAL forum list, plus AniList details
// If anything looks wrong the job throws instead of overwriting good data with bad.
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { anilist, BY_MAL_IDS_QUERY } from '../shared/anilist'
import { WEEKDAYS, type AiringData, type DubInfo, type MediaSummary } from '../shared/types'
import { FORUM_URL, parseForum } from './forum'

export const DUB_INFO_URL = 'https://raw.githubusercontent.com/MAL-Dubs/MAL-Dubs/main/data/dubInfo.json'
const USER_AGENT = 'AnimeDubStatus/2.0 (+https://animedubstatus.com)'

async function fetchText(url: string, fetchImpl: typeof fetch) {
  const res = await fetchImpl(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`${url} returned HTTP ${res.status}`)
  return res.text()
}

const isIdList = (v: unknown): v is number[] => Array.isArray(v) && v.every(Number.isInteger)

export function validateDubInfo(raw: string): DubInfo {
  const parsed = JSON.parse(raw) as Partial<DubInfo>
  if (!isIdList(parsed.dubbed) || !isIdList(parsed.incomplete) || parsed.dubbed.length < 1000) {
    throw new Error('dubInfo.json does not look right (expected thousands of dubbed MAL ids)')
  }
  return parsed as DubInfo
}

async function mediaByMalId(malIds: number[], fetchImpl: typeof fetch) {
  const byId = new Map<number, MediaSummary>()
  for (let i = 0; i < malIds.length; i += 50) {
    for (const media of await anilist(BY_MAL_IDS_QUERY, { ids: malIds.slice(i, i + 50) }, fetchImpl)) {
      if (media.malId && !byId.has(media.malId)) byId.set(media.malId, media)
    }
  }
  return byId
}

export async function buildData(fetchImpl: typeof fetch = fetch) {
  const [dubInfoRaw, forumHtml] = await Promise.all([
    fetchText(DUB_INFO_URL, fetchImpl),
    fetchText(FORUM_URL, fetchImpl),
  ])
  validateDubInfo(dubInfoRaw)

  const list = parseForum(forumHtml)
  const malIds = [...new Set(WEEKDAYS.flatMap(d => list.days[d].map(s => s.malId)))]
  if (malIds.length < 5) {
    throw new Error(`Only found ${malIds.length} airing dubs on the forum list; its layout probably changed`)
  }

  // AniList being down shouldn't stop the list itself from updating.
  let media = new Map<number, MediaSummary>()
  try {
    media = await mediaByMalId(malIds, fetchImpl)
  }
  catch (err) {
    console.error('AniList lookup failed; publishing without details', err)
  }

  const airing: AiringData = {
    generatedAt: new Date().toISOString(),
    listUpdated: list.listUpdated,
    days: Object.fromEntries(WEEKDAYS.map(day => [
      day,
      list.days[day].map(show => ({ ...show, media: media.get(show.malId) ?? null })),
    ])) as AiringData['days'],
    upcoming: list.upcoming,
  }
  console.log(`Built airing.json: ${malIds.length} dubs, ${media.size} with AniList details`)
  return { dubInfoRaw, airing }
}

const s3 = new S3Client({})

export async function handler() {
  const bucket = process.env.DATA_BUCKET
  if (!bucket) throw new Error('DATA_BUCKET is not set')
  const { dubInfoRaw, airing } = await buildData()

  const put = (key: string, body: string) => s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: 'application/json; charset=utf-8',
    // Short enough that a refresh shows up soon, long enough that CloudFront absorbs the traffic.
    CacheControl: 'public, max-age=900',
  }))
  await put('data/dub-info.json', dubInfoRaw)
  await put('data/airing.json', JSON.stringify(airing))
}
