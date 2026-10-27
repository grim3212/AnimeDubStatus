import { describe, expect, it } from 'vitest'
import { parseForum } from './forum'

// A trimmed copy of the forum post's markup, including its unclosed <li> tags.
const page = `<html><body>
<table id="message123" class="body clearfix"><tr><td>Intro text.<br />
Last Updated: <b>October 26, 2026</b><br />
<b>Currently Streaming SimulDubbed Anime - 4</b><br />
<ul><li>Monday<br />
<ul><li><a href="https://myanimelist.net/anime/63098/Psyren" rel="nofollow">PSYREN</a> (Episodes: 2/?)</ul><br />
<li>Tuesday<br />
<ul><li><a href="https://myanimelist.net/anime/21/One_Piece" rel="nofollow">One Piece</a>  (Episodes: 1156/????)<br />
<li><a href="https://myanimelist.net/anime/57612/X" rel="nofollow">A Returner&#039;s Magic Season 2</a> (Episodes: 3/12)</ul><br />
<li>Wednesday<br />
<ul></ul><br />
<li>Saturday<br />
<ul><li><a href="https://myanimelist.net/anime/50607/Go_Rush" rel="nofollow">Yu-Gi-Oh: Go Rush</a> (Episodes: 67/151)**</ul><br />
<br />
** = Dub production suspended until further notice.</ul><br />
<br />
<b>Upcoming SimulDubbed Anime for <i>Fall 2026</i> - 2</b><br />
<ul><li>Welsh &amp; Shedar - November 5, 2026<br />
<li>Dragon Ball Super: Beerus*<br />
<br />
* - Not confirmed.</ul><br />
<b>Finished SimulDubbed Anime - 1</b><br />
<ul><li><a href="https://myanimelist.net/anime/1/Done" rel="nofollow">Done</a> (Episodes: 12/12)</ul>
</td></tr></table>
<table id="message456"><tr><td>A reply that should be ignored.</td></tr></table>
</body></html>`

describe('parseForum', () => {
  const list = parseForum(page)

  it('reads the airing dubs per day', () => {
    expect(list.days.Monday).toEqual([
      { malId: 63098, title: 'PSYREN', dubbedEpisodes: 2, totalEpisodes: null, suspended: false },
    ])
    expect(list.days.Tuesday.map(d => d.malId)).toEqual([21, 57612])
    expect(list.days.Tuesday[0]).toMatchObject({ dubbedEpisodes: 1156, totalEpisodes: null })
    expect(list.days.Tuesday[1]).toMatchObject({ title: 'A Returner\'s Magic Season 2', totalEpisodes: 12 })
    expect(list.days.Wednesday).toEqual([])
  })

  it('flags suspended dubs without misreading the footnote', () => {
    expect(list.days.Saturday).toEqual([
      { malId: 50607, title: 'Yu-Gi-Oh: Go Rush', dubbedEpisodes: 67, totalEpisodes: 151, suspended: true },
    ])
  })

  it('ignores finished sections', () => {
    const ids = Object.values(list.days).flat().map(d => d.malId)
    expect(ids).not.toContain(1)
  })

  it('reads the upcoming simuldubs', () => {
    expect(list.upcoming).toEqual([{
      season: 'Fall 2026',
      items: [
        { title: 'Welsh & Shedar', date: 'November 5, 2026', confirmed: true },
        { title: 'Dragon Ball Super: Beerus', date: null, confirmed: false },
      ],
    }])
  })

  it('reads the last updated date', () => {
    expect(list.listUpdated).toBe('October 26, 2026')
  })

  it('throws when the page has no post', () => {
    expect(() => parseForum('<html></html>')).toThrow(/layout changed/)
  })
})
