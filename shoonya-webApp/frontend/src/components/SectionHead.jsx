/**
 * Section header: kicker, heading, optional standfirst, optional trailing
 * action. Replaces six hand-rolled copies of the same markup, three of which
 * carried inline `style={{ marginTop: '0.5rem', maxWidth: '40rem' }}` — that
 * spacing now comes from `.section__head p` in base.css.
 *
 * `id` is passed to the <h2> because most sections are labelled by their
 * heading via aria-labelledby.
 */
export default function SectionHead({ eyebrow, title, id, sub, action, center = false }) {
  return (
    <div className={`section__head ${center ? 'section__head--center' : ''}`}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 id={id}>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {action}
    </div>
  )
}
