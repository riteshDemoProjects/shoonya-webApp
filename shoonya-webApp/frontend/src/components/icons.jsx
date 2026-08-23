// Small line-style UI icons (distinct from the product illustrations).
const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const CartIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M6 7h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7Z" {...s} />
    <path d="M9 7a3 3 0 0 1 6 0" {...s} />
  </svg>
)
export const SearchIcon = (p) => (
  <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" {...p}>
    <circle cx="11" cy="11" r="7" {...s} />
    <path d="m20 20-3.5-3.5" {...s} />
  </svg>
)
export const MenuIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" {...s} />
  </svg>
)
export const CloseIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M6 6l12 12M18 6 6 18" {...s} />
  </svg>
)
export const PlusIcon = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...p}>
    <path d="M12 5v14M5 12h14" {...s} />
  </svg>
)
export const CheckIcon = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...p}>
    <path d="m5 12 5 5L20 7" {...s} />
  </svg>
)
export const ChevronDown = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
    <path d="m6 9 6 6 6-6" {...s} />
  </svg>
)
export const ArrowRight = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" {...s} />
  </svg>
)
export const TrashIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" {...s} />
  </svg>
)
export const UserIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <circle cx="12" cy="8" r="3.6" {...s} />
    <path d="M5 20a7 7 0 0 1 14 0" {...s} />
  </svg>
)
export const PackageIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" {...s} />
    <path d="M3.5 7.5 12 12m0 9v-9m8.5-4.5L12 12" {...s} />
  </svg>
)
export const LogoutIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" {...s} />
    <path d="M10 8 6 12l4 4M6 12h9" {...s} />
  </svg>
)
