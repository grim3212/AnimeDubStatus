import type { AiringDub, MediaSummary } from '#shared/types'

export type DubStatus = 'airing' | 'dubbed' | 'partial' | 'none' | 'unknown'

export const DUB_STATUS: Record<DubStatus, { label: string, answer: string, badge: string, text: string }> = {
  airing: {
    label: 'Dub airing',
    answer: 'Yes, the dub is airing now',
    badge: 'bg-sky-500/15 text-sky-300 ring-sky-400/40',
    text: 'text-sky-300',
  },
  dubbed: {
    label: 'Dubbed',
    answer: 'Yes, it\'s dubbed',
    badge: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/40',
    text: 'text-emerald-300',
  },
  partial: {
    label: 'Partly dubbed',
    answer: 'Partly. Not every episode is dubbed',
    badge: 'bg-amber-500/15 text-amber-300 ring-amber-400/40',
    text: 'text-amber-300',
  },
  none: {
    label: 'No dub',
    answer: 'No English dub yet',
    badge: 'bg-rose-500/15 text-rose-300 ring-rose-400/40',
    text: 'text-rose-300',
  },
  unknown: {
    label: 'Unknown',
    answer: 'Unknown: this entry isn\'t on MyAnimeList',
    badge: 'bg-slate-500/15 text-slate-300 ring-slate-400/40',
    text: 'text-slate-300',
  },
}

/** Something the detail view can show: a search result, or a dub from the airing list. */
export interface Selection {
  malId: number | null
  title: string
  media: MediaSummary | null
  airing?: AiringDub
}

const FORMATS: Record<string, string> = {
  TV: 'TV', TV_SHORT: 'TV short', MOVIE: 'Movie', SPECIAL: 'Special', OVA: 'OVA', ONA: 'ONA', MUSIC: 'Music',
}

/** e.g. "TV · Fall 2026 · 12 eps" */
export function mediaFacts(media: MediaSummary | null) {
  if (!media) return ''
  const season = media.season
    ? `${media.season[0]}${media.season.slice(1).toLowerCase()} ${media.seasonYear ?? ''}`.trim()
    : media.seasonYear?.toString()
  const eps = media.episodes ? `${media.episodes} ep${media.episodes === 1 ? '' : 's'}` : null
  return [media.format && (FORMATS[media.format] ?? media.format), season, eps].filter(Boolean).join(' · ')
}

/** "Sun 7:30 PM" in the viewer's time zone. */
export function formatAiringTime(unixSeconds: number) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })
    .format(new Date(unixSeconds * 1000))
}

/** "in 5h", "in 2d" */
export function formatRelative(unixSeconds: number, now = Date.now()) {
  const minutes = Math.round((unixSeconds * 1000 - now) / 60_000)
  if (minutes <= 0) return 'now'
  if (minutes < 60) return `in ${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `in ${hours}h`
  return `in ${Math.round(hours / 24)}d`
}

export function dubProgress(show: AiringDub) {
  if (show.dubbedEpisodes == null) return null
  return show.totalEpisodes
    ? `Ep ${show.dubbedEpisodes} / ${show.totalEpisodes}`
    : `Ep ${show.dubbedEpisodes}`
}
