/*
* A type that may exist but not always
*/
export type Maybe<T> = NonNullable<T> | undefined;

export enum DubMatch {
  None,
  InComplete,
  CurrentlyAiring,
  Dubbed,
}

export interface DubInfo {
  dubbed: number[]
  incomplete: number[]
}

export interface Anime {
  mal_id: number
  title: string
  url: string
  image_url: string
  type?: string
  score?: number
  synopsis?: string
}
export interface FullAnime extends Anime {
  title_english?: string
  title_japanese?: string
  title_synonyms?: string[]
  status?: string
  genres?: string[]
  themes?: string[]
  external_links?: [string, string][]
  score?: number
  scored_by?: number
  rank?: number
  popularity?: number
  members?: number
  favorites?: number
  episodes?: number
  aired?: string
  premiered?: string
  broadcast?: string
  producers?: string[]
  licensors?: string[]
  studios?: string[]
  duration?: string
  rating?: string
  related_anime?: { [x: string]: string[] }
  opening_themes?: string[]
  ending_themes?: string[]
  background?: string
}

export interface RelatedAnime {
  [x: string]: string[]
}

export interface AnimeDetailResult {
  [x: string]: FullAnime
}

export interface EpisodeCount {
  current: string
  total: string
}

export interface Episodes {
  [x: string]: EpisodeCount
}

export interface DubCurrentlyAiring {
  mal_id: number
  name: string
  episodes: Episodes[]
  details: FullAnime
}

export interface CurrentlyAiringList {
  Monday: DubCurrentlyAiring[]
  Tuesday: DubCurrentlyAiring[]
  Wednesday: DubCurrentlyAiring[]
  Thursday: DubCurrentlyAiring[]
  Friday: DubCurrentlyAiring[]
  Saturday: DubCurrentlyAiring[]
  Sunday: DubCurrentlyAiring[]
}

export type SearchState = {
  search: string
  animes: Anime[]
  loading: boolean
}
