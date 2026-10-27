import { createHash } from 'node:crypto'

/**
 * The Content-Security-Policy, minus script hashes. nuxt.config.ts writes it into every
 * generated page as a <meta> tag (see withCspMeta), because Nuxt's inline scripts change with
 * every build. CloudFront adds the headers a <meta> CSP can't set (X-Frame-Options etc.).
 */
export const CSP_DIRECTIVES = {
  'default-src': ['\'self\''],
  // Cloudflare (which proxies the domain) injects its Web Analytics beacon.
  'script-src': ['\'self\'', 'https://static.cloudflareinsights.com'],
  // Vue sets inline styles (cover placeholder colors, progress bars).
  'style-src': ['\'self\'', '\'unsafe-inline\''],
  'img-src': ['\'self\'', 'data:', 'https://s4.anilist.co'],
  // Searches go from the browser to AniList.
  'connect-src': ['\'self\'', 'https://graphql.anilist.co', 'https://cloudflareinsights.com'],
  'object-src': ['\'none\''],
  'base-uri': ['\'none\''],
  'form-action': ['\'self\''],
}

/** Adds a CSP <meta> that allows exactly the inline scripts in this page. */
export function withCspMeta(html: string) {
  const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)]
    // JSON data blocks are never executed, so CSP doesn't apply to them.
    .filter(([, attrs]) => !/type="application\/(ld\+)?json"/.test(attrs ?? ''))
    .map(([, , body]) => `'sha256-${createHash('sha256').update(body ?? '').digest('base64')}'`)

  const directives = { ...CSP_DIRECTIVES, 'script-src': [...CSP_DIRECTIVES['script-src'], ...hashes] }
  const policy = Object.entries(directives).map(([k, v]) => `${k} ${v.join(' ')}`).join('; ')
  return html.replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${policy}">`)
}
