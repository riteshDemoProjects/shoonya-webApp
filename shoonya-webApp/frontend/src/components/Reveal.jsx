import { useEffect, useRef, useState } from 'react'

/**
 * Fade-and-rise on first scroll into view.
 *
 * One observer per element, disconnected the moment it fires — these never
 * re-hide, so keeping hundreds of live observers around would be waste. The
 * visible state is a class (`.is-in`), not inline style, so the transition and
 * the reduced-motion fallback both live in CSS.
 */
export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)
  // Someone who asked their OS for less motion gets the content, not the
  // animation — and gets it even if IntersectionObserver never fires.
  const [shown, setShown] = useState(
    () =>
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (shown || !ref.current) return undefined
    const el = ref.current
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        io.disconnect()
      },
      // A little before the edge, so the element is already settled by the time
      // it is properly in view rather than animating under the reader's eye.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'is-in' : ''} ${className}`.trim()}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
