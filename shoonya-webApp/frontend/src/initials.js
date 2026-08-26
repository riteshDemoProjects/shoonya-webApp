// Two-letter monogram for the account avatar, shared by the header button and
// the account sidebar (both had their own copy of this).
//
// Returns null rather than a placeholder glyph when a name yields no letters —
// the fallback used to be 🌿, which rendered as a full-colour emoji inside a
// forest-green disc on every platform. Call sites show a person mark instead.
export function initials(name = '') {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
  return letters || null
}
