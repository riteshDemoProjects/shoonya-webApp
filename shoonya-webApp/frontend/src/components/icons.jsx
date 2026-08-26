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
export const ArrowDown = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" {...s} />
  </svg>
)
export const AlertIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <circle cx="12" cy="12" r="9" {...s} />
    <path d="M12 7.5v5.5" {...s} />
    <circle cx="12" cy="16.4" r="1" fill="currentColor" stroke="none" />
  </svg>
)
export const BasketIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M3 9h18l-1.6 9a2 2 0 0 1-2 1.7H6.6a2 2 0 0 1-2-1.7L3 9Z" {...s} />
    <path d="M8.5 9 10 4m5.5 5L14 4M9.5 13v3m5-3v3" {...s} />
  </svg>
)
export const LockIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" {...s} />
    <path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" {...s} />
  </svg>
)

// ---- Brand-value icons ------------------------------------------------------
// These replace the 🌿 / 🔬 / 🐄 / 🚚 emoji that used to carry the trust
// claims. Emoji render in a different style on every platform (and in full
// colour on all of them), so a row of four never looked like one set.
export const LeafIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M20 4C10 4 4 9 4 16v4" {...s} />
    <path d="M20 4c0 9-6 13-13 13H4" {...s} />
  </svg>
)
export const FlaskIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M9 3h6M10 3v6l-5 8a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-8V3" {...s} />
    <path d="M7 15h10" {...s} />
  </svg>
)
export const PotIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M4 9h16v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" {...s} />
    <path d="M2 9h20M9 6c0-2 1.5-3 3-3s3 1 3 3" {...s} />
  </svg>
)
export const TruckIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M2 7h11v9H2zM13 10h4l3 3v3h-7" {...s} />
    <circle cx="6.5" cy="18" r="1.8" {...s} />
    <circle cx="16.5" cy="18" r="1.8" {...s} />
  </svg>
)

// ---- Category icons ---------------------------------------------------------
// Keyed by the same `theme` string the product illustrations use, so a category
// card and its products always show the same family of shape.
const JarIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M6 9h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9Z" {...s} />
    <path d="M7 5h10v4H7zM9 3h6" {...s} />
  </svg>
)
const CombIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M12 3l7 4v10l-7 4-7-4V7l7-4Z" {...s} />
    <path d="M12 8.5l3 1.7v3.6l-3 1.7-3-1.7v-3.6l3-1.7Z" {...s} />
  </svg>
)
const BottleIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M10 3h4v4l2.5 3.5V19a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-8.5L10 7V3Z" {...s} />
    <path d="M7.5 14h9" {...s} />
  </svg>
)
const DropIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M12 3c3.5 4.2 5.5 7.1 5.5 9.8A5.5 5.5 0 0 1 12 18.3a5.5 5.5 0 0 1-5.5-5.5C6.5 10.1 8.5 7.2 12 3Z" {...s} />
  </svg>
)
const BeanIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M4 11h16a8 8 0 0 1-8 9 8 8 0 0 1-8-9Z" {...s} />
    <circle cx="9" cy="6.5" r="2.5" {...s} />
    <circle cx="15" cy="7.5" r="2" {...s} />
  </svg>
)
const GrainIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M12 21V8" {...s} />
    <path d="M12 8c-3 0-4.5-1.7-4.5-4.5C10.5 3.5 12 5.2 12 8Zm0 0c3 0 4.5-1.7 4.5-4.5C13.5 3.5 12 5.2 12 8Z" {...s} />
    <path d="M12 14c-3 0-4.5-1.7-4.5-4.5C10.5 9.5 12 11.2 12 14Zm0 0c3 0 4.5-1.7 4.5-4.5C13.5 9.5 12 11.2 12 14Z" {...s} />
  </svg>
)
const CubeIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" {...s} />
    <path d="m4 8.5 8 4.5 8-4.5M12 13v7" {...s} />
  </svg>
)
const MortarIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M4 11h16a8 8 0 0 1-4.5 7.2V21h-7v-2.8A8 8 0 0 1 4 11Z" {...s} />
    <path d="M14 11 18 4" {...s} />
  </svg>
)
const GiftIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
    <path d="M3 9h18v3H3zM4.5 12v7a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-7M12 9v12" {...s} />
    <path d="M12 9C10 5.5 8 4 6.8 4.8 5.6 5.6 6.5 8 12 9Zm0 0c2-3.5 4-5 5.2-4.2C18.4 5.6 17.5 8 12 9Z" {...s} />
  </svg>
)

const CATEGORY_ICONS = {
  ghee: JarIcon,
  honey: CombIcon,
  oil: BottleIcon,
  essential: DropIcon,
  dal: BeanIcon,
  atta: GrainIcon,
  sweet: CubeIcon,
  spice: MortarIcon,
  salt: MortarIcon,
  combo: GiftIcon,
}
export function CategoryIcon({ theme, ...rest }) {
  const Icon = CATEGORY_ICONS[theme] || GiftIcon
  return <Icon {...rest} />
}

// ---- Social ----------------------------------------------------------------
// Filled marks rather than stroked: at 17px in the footer bar, a 2px stroke on
// a glyph this dense turns to mud.
export const InstagramIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" {...s} />
    <circle cx="12" cy="12" r="4" {...s} />
    <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)
export const FacebookIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}>
    <path
      d="M13.5 21v-7h2.6l.4-3h-3V9.2c0-.9.3-1.5 1.6-1.5H17V5.1A21 21 0 0 0 14.9 5C12.7 5 11 6.3 11 8.9V11H8.5v3H11v7h2.5Z"
      fill="currentColor"
    />
  </svg>
)
export const YoutubeIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" {...s} />
    <path d="m10.5 9.5 5 2.5-5 2.5v-5Z" fill="currentColor" stroke="none" />
  </svg>
)
export const WhatsappIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}>
    <path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.6Z" {...s} />
    <path d="M9.2 9.4c0 2.6 2.1 4.7 4.7 4.7.6 0 1.1-.6.8-1.1l-.6-1-1.3.4-1.9-1.9.4-1.3-1-.6c-.5-.3-1.1.2-1.1.8Z" fill="currentColor" stroke="none" />
  </svg>
)
