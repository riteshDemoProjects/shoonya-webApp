/**
 * Image beside prose — the site's core editorial unit.
 *
 * There were four separate hand-built versions of this (the story beginning,
 * the temple, the community impact band, and the home page's story teaser),
 * each with its own grid declaration and its own idea of the gap. They are all
 * this component now.
 *
 * The media is always first in the DOM, which is the right reading order and
 * the right stacking order on a phone; `reverse` flips only the visual column
 * on desktop, via `order` in CSS.
 */
export default function SplitFeature({
  media,
  children,
  reverse = false,
  top = false,
  mediaLead = false,
  offset = false,
  className = '',
}) {
  const cls = [
    'split',
    reverse && 'split--reverse',
    top && 'split--top',
    mediaLead && 'split--media-lead',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls}>
      <div className={`split__media ${offset ? 'split__media--offset' : ''}`}>{media}</div>
      <div className="split__body">{children}</div>
    </div>
  )
}
