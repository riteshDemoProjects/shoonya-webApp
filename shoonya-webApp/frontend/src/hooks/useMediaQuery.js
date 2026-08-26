import { useEffect, useState } from 'react'

/**
 * Subscribe to a media query.
 *
 * Used where a layout decision can't be expressed in CSS alone — the footer
 * columns are <details> elements, and `open` is an attribute, not a style, so
 * "expanded on desktop, collapsed on mobile" has to be decided in JS.
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    // Re-sync on mount: the query may have changed between the initial render
    // and this effect (a resize during hydration, or a changed `query`).
    setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
