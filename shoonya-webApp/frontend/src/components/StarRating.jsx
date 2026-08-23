export default function StarRating({ value = 0, reviews }) {
  const full = Math.round(value)
  return (
    <span className="rating">
      <span className="stars" aria-hidden="true">
        {'★'.repeat(full)}
        {'☆'.repeat(Math.max(0, 5 - full))}
      </span>
      <span className="rating__val">{value.toFixed(1)}</span>
      {reviews != null && <span className="rating__count">({reviews})</span>}
    </span>
  )
}
