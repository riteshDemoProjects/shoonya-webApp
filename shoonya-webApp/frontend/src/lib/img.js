// Unsplash serves its own resizer on the query string, so a responsive srcset
// costs nothing but string work — no build step, no image pipeline.

const HOST = 'images.unsplash.com'

/**
 * Build a srcset for an Unsplash URL, preserving whatever crop ratio the
 * original URL asked for.
 *
 * The catalog URLs look like `?w=800&h=600&fit=crop`. Rewriting only `w` would
 * change the aspect ratio at every breakpoint and break the crop, so `h` is
 * scaled by the same factor.
 *
 * Returns null for any other host, in which case the caller just ships `src`.
 */
export function unsplashSrcSet(src, widths = [480, 768, 1024, 1440, 1920]) {
  let url
  try {
    url = new URL(src)
  } catch {
    return null
  }
  if (url.hostname !== HOST) return null

  const w0 = Number(url.searchParams.get('w')) || 0
  const h0 = Number(url.searchParams.get('h')) || 0

  return widths
    .map((w) => {
      const params = new URLSearchParams(url.searchParams)
      params.set('w', String(w))
      if (w0 && h0) params.set('h', String(Math.round((h0 * w) / w0)))
      return `${url.origin}${url.pathname}?${params.toString()} ${w}w`
    })
    .join(', ')
}
