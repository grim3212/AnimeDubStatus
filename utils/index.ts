import { Anime } from '@/types'

export function getLargeImage(anime: Anime): string {
  if (anime.image_url) {
    // `l` is for the larger image from MyAnimeList
    return replaceExtension(anime.image_url, 'l.jpg')
  }
  return ''
}

export function getSmallImage(anime: Anime): string {
  if (anime.image_url) {
    // `l` is for the larger image from MyAnimeList
    return replaceExtension(anime.image_url, 't.jpg')
  }
  return ''
}

export function replaceExtension(filename: string, newExtension: string): string {
  const extensionIndex = filename.lastIndexOf('.')
  const currentExtension = filename.slice(extensionIndex)
  const filenameWithoutExtension = filename.slice(0, -currentExtension.length)
  return filenameWithoutExtension + newExtension
}
