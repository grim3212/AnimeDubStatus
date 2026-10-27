// Parses Kenny_Stryker's "Upcoming Dubbed Anime" MyAnimeList forum post
// (https://myanimelist.net/forum/?topicid=1692966). The post is hand-written HTML with unclosed
// <li> tags, so this splits on tags instead of walking a DOM tree.
import { parse } from 'node-html-parser'
import { WEEKDAYS, type UpcomingGroup, type Weekday } from '../shared/types'

export const FORUM_URL = 'https://myanimelist.net/forum/?topicid=1692966'

export interface ForumDub {
  malId: number
  title: string
  dubbedEpisodes: number | null
  totalEpisodes: number | null
  suspended: boolean
}

export interface ForumList {
  listUpdated: string | null
  days: Record<Weekday, ForumDub[]>
  upcoming: UpcomingGroup[]
}

const text = (html: string) => parse(html).text.replace(/\s+/g, ' ').trim()

/** The first line of a <li> chunk: everything before the next <br>, <ul> or </ul>. */
const firstLine = (chunk: string) => chunk.split(/<br\s*\/?>|<\/?ul>/i)[0] ?? ''

/** Splits the post into { heading, body } sections on its <b>...</b> headings. */
function sections(postHtml: string) {
  const headings = [...postHtml.matchAll(/<b>(.*?)<\/b>/gis)]
  return headings.map((h, i) => ({
    heading: text(h[1] ?? ''),
    body: postHtml.slice(h.index + h[0].length, headings[i + 1]?.index ?? postHtml.length),
  }))
}

export function parseForum(pageHtml: string): ForumList {
  // The first message on the page is the list itself.
  const post = parse(pageHtml).querySelector('table[id^="message"] td')
  if (!post) throw new Error('Forum page layout changed: could not find the first post')
  const postHtml = post.innerHTML

  const days = Object.fromEntries(WEEKDAYS.map(d => [d, [] as ForumDub[]])) as Record<Weekday, ForumDub[]>
  const upcoming: UpcomingGroup[] = []

  for (const { heading, body } of sections(postHtml)) {
    if (/^Currently Streaming SimulDubbed Anime/i.test(heading)) {
      let day: Weekday | undefined
      for (const chunk of body.split(/<li>/i).slice(1)) {
        const line = firstLine(chunk)
        const lineText = text(line)
        if ((WEEKDAYS as readonly string[]).includes(lineText)) {
          day = lineText as Weekday
          continue
        }
        const link = line.match(/<a [^>]*href="https?:\/\/myanimelist\.net\/anime\/(\d+)[^"]*"[^>]*>(.*?)<\/a>/i)
        if (!day || !link) continue
        const episodes = lineText.match(/\(Episodes:\s*(\d+)\s*\/\s*(\d+|\?+)\s*\)/i)
        days[day].push({
          malId: Number(link[1]),
          title: text(link[2] ?? ''),
          dubbedEpisodes: episodes ? Number(episodes[1]) : null,
          totalEpisodes: episodes && /^\d+$/.test(episodes[2] ?? '') ? Number(episodes[2]) : null,
          suspended: /\)\s*\*\*/.test(lineText),
        })
      }
    }

    const season = heading.match(/^Upcoming SimulDubbed Anime for (.+?)(?:\s*-\s*\d+)?$/i)?.[1]
    if (season) {
      const items = body.split(/<li>/i).slice(1).map(chunk => text(firstLine(chunk))).filter(Boolean)
      upcoming.push({
        season,
        items: items.map((item) => {
          const confirmed = !item.endsWith('*')
          const clean = item.replace(/\*+$/, '').trim()
          const dated = clean.match(/^(.*?)\s+-\s+([A-Z][a-z]+ \d{1,2}, \d{4})$/)
          return { title: dated?.[1] ?? clean, date: dated?.[2] ?? null, confirmed }
        }),
      })
    }
  }

  const listUpdated = postHtml.match(/Last Updated:\s*<b>([^<]+)<\/b>/i)?.[1]?.trim() ?? null
  return { listUpdated, days, upcoming }
}
