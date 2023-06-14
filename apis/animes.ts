import axios from 'axios'
import { Maybe, AnimeDetailResult, FullAnime, Anime } from '@/types'

export const get = async(malId: number): Promise<Maybe<FullAnime>> => {
  try {
    const anime = await axios.get<AnimeDetailResult>(
        `https://api.animedubstatus.com/anime?mal_ids=${malId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
    )
    if (anime.status === 200 && anime.data) {
      const fullDetails = anime.data[malId]
      return fullDetails
    }
  } catch (error) {
    console.error(error)
  }
}

export const search = async(query: string): Promise<Maybe<Anime[]>> => {
  try {
    const searchAnime = await axios.get<Anime[]>(
        `https://api.animedubstatus.com/search?query=${encodeURI(query)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
    )
    if (searchAnime.status === 200 && searchAnime.data?.length) {
      return searchAnime.data
    } else {
      return []
    }
  } catch (error) {
    console.error(error)
  }
}
