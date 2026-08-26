import SmartImage from './SmartImage'

/**
 * Photograph, name, role, one paragraph. No border, no padding, no shadow —
 * the image edge is the card edge.
 *
 * `.team-card` and `.craft-card` in the old stylesheet were byte-identical rule
 * sets, both describing a bordered box with 24px of padding around a 16:10
 * image. This is the one component behind both grids.
 */
export default function MediaCard({
  img,
  alt,
  title,
  meta,
  children,
  ratio = 'square',
  sizes = '(max-width: 720px) 66vw, (max-width: 1024px) 45vw, 285px',
}) {
  return (
    <article className="media-card">
      <SmartImage src={img} alt={alt ?? title} ratio={ratio} sizes={sizes} zoom width={600} />
      <div className="media-card__body">
        <h3>{title}</h3>
        {meta && <span className="media-card__meta">{meta}</span>}
        {children && <p>{children}</p>}
      </div>
    </article>
  )
}
