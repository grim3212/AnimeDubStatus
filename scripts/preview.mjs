// `npm run preview`: serves the generated site (.output/public) at http://localhost:3000, the way
// S3 + CloudFront will. Run `npm run build` first (and `npm run refresh-data` for real data).
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../.output/public', import.meta.url))
const port = Number(process.env.PORT) || 3000
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
}

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname)
  if (path.endsWith('/')) path += 'index.html'
  // normalize() strips any ../ so requests stay inside the site folder.
  const file = join(root, normalize(path).replace(/^(\.\.[/\\])+/, ''))
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }).end(body)
  }
  catch {
    res.writeHead(404, { 'Content-Type': types['.html'] }).end(await readFile(join(root, '404.html')).catch(() => 'Not found'))
  }
}).listen(port, () => console.log(`Previewing .output/public at http://localhost:${port}`))
