// One announcement instead of four fragments: the stars, the number and the
// review count are all decorative to a screen reader, which gets the whole
// rating as the group's label. role="img" is what makes that label reliable on
// an otherwise generic element.
export default function StarRating({ value = 0, reviews }) {
  const full = Math.round(value)
  const label =
    `Rated ${value.toFixed(1)} out of 5` +
    (reviews != null ? ` from ${reviews} reviews` : '')

  return (
    <span className="rating" role="img" aria-label={label}>
      <span className="stars" aria-hidden="true">
        {'★'.repeat(full)}
        {'☆'.repeat(Math.max(0, 5 - full))}
      </span>
      <span className="rating__val" aria-hidden="true">{value.toFixed(1)}</span>
      {reviews != null && <span className="rating__count" aria-hidden="true">({reviews})</span>}
    </span>
  )
}
