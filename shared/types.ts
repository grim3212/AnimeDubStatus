// Shapes of the JSON files that jobs/refresh-data.ts writes to /data/ and the site reads.

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
export type Weekday = (typeof WEEKDAYS)[number]

/** /data/dub-info.json: MAL-Dubs' dubInfo.json (AGPL-3.0), copied as-is. */
export interface DubInfo {
  dubbed: number[]
  incomplete: number[]
}

/** The parts of an AniList media entry the site shows. */
export interface MediaSummary {
  anilistId: number
  malId: number | null
  title: string
  romaji: string
  native: string | null
  synonyms: string[]
  format: string | null
  status: string | null
  episodes: number | null
  season: string | null
  seasonYear: number | null
  averageScore: number | null
  genres: string[]
  description: string | null
  /** ~230px wide cover, for cards. */
  cover: string | null
  /** ~460px wide cover, for the detail view. */
  coverLarge: string | null
  color: string | null
  siteUrl: string
  /** Next Japanese broadcast; `airingAt` is unix seconds. */
  nextAiringEpisode: { episode: number, airingAt: number } | null
}

/** A dub from the "Currently Streaming SimulDubbed Anime" list. */
export interface AiringDub {
  malId: number
  /** English title as written in the list. */
  title: string
  /** Dubbed episodes released so far, and the total if known. */
  dubbedEpisodes: number | null
  totalEpisodes: number | null
  /** Marked "**" in the list: dub production suspended. */
  suspended: boolean
  media: MediaSummary | null
}

export interface UpcomingDub {
  title: string
  /** Free text from the list, e.g. "November 5, 2026". */
  date: string | null
  confirmed: boolean
}

export interface UpcomingGroup {
  /** e.g. "Fall 2026" */
  season: string
  items: UpcomingDub[]
}

/** /data/airing.json */
export interface AiringData {
  /** ISO time this file was generated. */
  generatedAt: string
  /** "Last Updated" date shown on the forum list. */
  listUpdated: string | null
  days: Record<Weekday, AiringDub[]>
  upcoming: UpcomingGroup[]
}
