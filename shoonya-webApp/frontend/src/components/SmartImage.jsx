import { unsplashSrcSet } from '../lib/img'

/**
 * Every photograph on the site goes through here.
 *
 * Three things it guarantees that a bare <img> did not:
 *  - the box is reserved before the bytes land (`aspect-ratio` on the frame plus
 *    intrinsic width/height on the image), so nothing below it jumps — the old
 *    story page shifted layout four times while its images loaded
 *  - a real srcset, so a phone downloads a 480px crop instead of the 1920px one
 *  - lazy + async decode by default, with an explicit opt-out for the one image
 *    above the fold, which must be eager and high priority instead
 */
export default function SmartImage({
  src,
  alt = '',
  ratio = 'landscape',
  sizes = '100vw',
  priority = false,
  zoom = false,
  width = 1200,
  height,
  widths,
  className = '',
  position,
}) {
  const srcSet = unsplashSrcSet(src, widths)
  const cls = ['frame', ratio && `frame--${ratio}`, zoom && 'frame--zoom', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls}>
      <img
        src={src}
        srcSet={srcSet || undefined}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        width={width}
        height={height || Math.round(width * RATIO_H[ratio] || width * 0.667)}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        // Lowercase: React 18 doesn't know the camelCase `fetchPriority` prop
        // and warns, then drops it. Spelled the way HTML spells it, it passes
        // straight through to the attribute browsers actually read.
        fetchpriority={priority ? 'high' : undefined}
        style={position ? { objectPosition: position } : undefined}
      />
    </div>
  )
}

// Intrinsic height is derived from the same ratio the CSS frame uses, so the
// two can't disagree and produce a shift on load.
const RATIO_H = {
  square: 1,
  portrait: 1.25,
  landscape: 0.667,
  wide: 0.5625,
}
