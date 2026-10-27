// `npm run refresh-data`: runs the data job locally and writes public/data/*.json for `npm run dev`.
import { mkdirSync, writeFileSync } from 'node:fs'
import { buildData } from './refresh-data'

const outDir = new URL('../public/data/', import.meta.url)
const { dubInfoRaw, airing } = await buildData()
mkdirSync(outDir, { recursive: true })
writeFileSync(new URL('dub-info.json', outDir), dubInfoRaw)
writeFileSync(new URL('airing.json', outDir), JSON.stringify(airing, null, 2))
console.log(`Wrote ${new URL('.', outDir).pathname}`)
