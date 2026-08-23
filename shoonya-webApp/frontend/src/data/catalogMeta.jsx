// Design metadata for the storefront: hand-built SVG product illustrations,
// per-category gradient "themes", category display info, and currency helper.

export const formatINR = (n) => `₹${new Intl.NumberFormat('en-IN').format(n)}`

// Soft gradient backgrounds behind each product illustration.
export const THEMES = {
  ghee: 'linear-gradient(145deg,#fff6df,#f6e0a4)',
  honey: 'linear-gradient(145deg,#fff1d6,#f4d089)',
  oil: 'linear-gradient(145deg,#f2f4dd,#d7e1a6)',
  essential: 'linear-gradient(145deg,#e6f2ea,#c3e2d0)',
  dal: 'linear-gradient(145deg,#f6efe0,#e6d4b0)',
  atta: 'linear-gradient(145deg,#f7f0e2,#ead9bd)',
  sweet: 'linear-gradient(145deg,#f4e6d3,#e0c096)',
  spice: 'linear-gradient(145deg,#fdeec6,#f2cf78)',
  salt: 'linear-gradient(145deg,#fbeef0,#f0cdd5)',
  combo: 'linear-gradient(145deg,#eef1e5,#d4dfbb)',
}

// Order items only snapshot the icon key, not the theme — map it back so past
// orders render with the same gradient the product uses in the catalog.
const ICON_THEME = {
  ghee: 'ghee', honey: 'honey', oil: 'oil', essential: 'essential',
  dal: 'dal', atta: 'atta', rice: 'atta', sweet: 'sweet',
  spice: 'spice', salt: 'salt', combo: 'combo',
}
export const iconTheme = (icon) => ICON_THEME[icon] || 'combo'

// Category cards / filter metadata.
export const CATEGORY_META = {
  Ghee: { emoji: '🧈', tag: 'A2, bilona-churned', theme: 'ghee' },
  Honey: { emoji: '🍯', tag: 'Raw & single-origin', theme: 'honey' },
  'Cold-Pressed Oils': { emoji: '🫒', tag: 'Wood-pressed', theme: 'oil' },
  'Essential Oils': { emoji: '💧', tag: 'Pure aromatherapy', theme: 'essential' },
  'Dals & Pulses': { emoji: '🫘', tag: 'Hand-milled', theme: 'dal' },
  'Atta & Grains': { emoji: '🌾', tag: 'Stone-milled', theme: 'atta' },
  Sweeteners: { emoji: '🍬', tag: 'Chemical-free', theme: 'sweet' },
  'Spices & Salt': { emoji: '🧂', tag: 'Whole & ground', theme: 'spice' },
  Combos: { emoji: '🎁', tag: 'Curated bundles', theme: 'combo' },
}

const shadow = <ellipse cx="50" cy="88" rx="27" ry="4.5" fill="#1f3a10" opacity=".08" />

// Each illustration is a self-contained SVG (no <defs> ids to avoid collisions).
export const ICONS = {
  ghee: (
    <svg viewBox="0 0 100 100">
      {shadow}
      <rect x="26" y="40" width="48" height="46" rx="10" fill="#f0c34e" />
      <rect x="30" y="30" width="40" height="13" rx="5" fill="#d29f2a" />
      <rect x="42" y="21" width="16" height="11" rx="4" fill="#c8961f" />
      <rect x="31" y="52" width="38" height="23" rx="4" fill="#fff8e6" />
      <path d="M38 64c5-8 9-8 14 0" stroke="#d29f2a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="59" cy="60" r="2.4" fill="#e0a52e" />
      <rect x="30" y="44" width="6" height="40" rx="3" fill="#fff" opacity=".28" />
    </svg>
  ),
  honey: (
    <svg viewBox="0 0 100 100">
      {shadow}
      <rect x="30" y="42" width="40" height="44" rx="13" fill="#e79a2a" />
      <rect x="30" y="42" width="40" height="16" rx="12" fill="#f0b54f" />
      <rect x="27" y="33" width="46" height="12" rx="5" fill="#b5670f" />
      <rect x="34" y="59" width="32" height="20" rx="3" fill="#fff6e2" />
      <path d="M50 8v22" stroke="#8a5a12" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="31" r="6" fill="#f0b54f" />
      <rect x="34" y="47" width="6" height="32" rx="3" fill="#fff" opacity=".22" />
    </svg>
  ),
  oil: (
    <svg viewBox="0 0 100 100">
      {shadow}
      <rect x="44" y="16" width="12" height="16" rx="2" fill="#cfd8a0" />
      <rect x="42" y="11" width="16" height="8" rx="2" fill="#7d8a3f" />
      <path d="M40 32c-6 4-10 10-10 20v22a8 8 0 0 0 8 8h24a8 8 0 0 0 8-8V52c0-10-4-16-10-20Z" fill="#e9edcf" />
      <path d="M30 60v14a8 8 0 0 0 8 8h24a8 8 0 0 0 8-8V60Z" fill="#c3d16a" />
      <rect x="34" y="58" width="32" height="18" rx="3" fill="#fff" opacity=".6" />
      <path d="M43 66h14M43 70h10" stroke="#8a9a3f" strokeWidth="2" strokeLinecap="round" />
      <rect x="36" y="38" width="5" height="42" rx="3" fill="#fff" opacity=".4" />
    </svg>
  ),
  essential: (
    <svg viewBox="0 0 100 100">
      {shadow}
      <rect x="42" y="20" width="16" height="11" rx="2" fill="#3f5a45" />
      <rect x="46" y="7" width="8" height="15" rx="3" fill="#6f9a3f" />
      <path d="M37 31h26v33a13 13 0 0 1-13 13 13 13 0 0 1-13-13Z" fill="#2f6b4a" />
      <rect x="41" y="45" width="18" height="21" rx="3" fill="#eaf3ec" />
      <path d="M50 49l2.5 5 5 .5-4 3.5 1.2 5-4.7-2.8-4.7 2.8 1.2-5-4-3.5 5-.5Z" fill="#6f9a3f" />
      <rect x="40" y="35" width="4" height="30" rx="2" fill="#fff" opacity=".2" />
    </svg>
  ),
  dal: (
    <svg viewBox="0 0 100 100">
      {shadow}
      <path d="M33 41c0-6 4-9 8-11l-3-8h24l-3 8c4 2 8 5 8 11v29a14 14 0 0 1-14 14H47a14 14 0 0 1-14-14Z" fill="#d8bd86" />
      <path d="M38 22c4 3 20 3 24 0" stroke="#a98a4f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="60" rx="13" ry="11" fill="#b89b62" />
      <circle cx="45" cy="58" r="2.3" fill="#8a6f3a" />
      <circle cx="52" cy="55" r="2.3" fill="#8a6f3a" />
      <circle cx="50" cy="64" r="2.3" fill="#8a6f3a" />
      <circle cx="56" cy="61" r="2" fill="#8a6f3a" />
      <rect x="37" y="46" width="5" height="34" rx="3" fill="#fff" opacity=".18" />
    </svg>
  ),
  atta: (
    <svg viewBox="0 0 100 100">
      {shadow}
      <path d="M30 34l6-8h28l6 8v42a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8Z" fill="#eaddc2" />
      <path d="M30 34l6-8h28l6 8Z" fill="#dcc9a3" />
      <path d="M42 26l-2 8M58 26l2 8M50 26v8" stroke="#c7b489" strokeWidth="1.6" />
      <rect x="37" y="46" width="26" height="27" rx="4" fill="#fff" opacity=".72" />
      <path d="M50 51c5 5 5 12 0 17-5-5-5-12 0-17Z" fill="#c9a24a" />
      <path d="M50 52v14M50 56l4-3M50 60l4-3M50 56l-4-3M50 60l-4-3" stroke="#a9852f" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="34" y="40" width="5" height="42" rx="3" fill="#fff" opacity=".25" />
    </svg>
  ),
  sweet: (
    <svg viewBox="0 0 100 100">
      {shadow}
      <rect x="23" y="52" width="31" height="27" rx="5" fill="#a55a22" />
      <rect x="47" y="47" width="29" height="32" rx="5" fill="#b9692b" />
      <rect x="35" y="33" width="27" height="25" rx="5" fill="#c9793a" />
      <ellipse cx="48" cy="40" rx="9" ry="4" fill="#e0965a" opacity=".7" />
      <circle cx="32" cy="63" r="2" fill="#7d3f14" />
      <circle cx="65" cy="61" r="2" fill="#7d3f14" />
      <circle cx="52" cy="68" r="2" fill="#8a4718" />
    </svg>
  ),
  spice: (
    <svg viewBox="0 0 100 100">
      {shadow}
      <rect x="30" y="40" width="40" height="46" rx="8" fill="#f2c84b" opacity=".38" />
      <path d="M34 86c-1-18 4-27 16-27s17 9 16 27Z" fill="#e0a11a" />
      <rect x="29" y="30" width="42" height="12" rx="4" fill="#8a5a12" />
      <rect x="44" y="24" width="12" height="8" rx="3" fill="#a06a1c" />
      <circle cx="44" cy="72" r="2.4" fill="#c98416" />
      <circle cx="54" cy="76" r="2.4" fill="#c98416" />
      <rect x="33" y="44" width="6" height="42" rx="3" fill="#fff" opacity=".3" />
    </svg>
  ),
  salt: (
    <svg viewBox="0 0 100 100">
      {shadow}
      <path d="M36 40h28v36a8 8 0 0 1-8 8H44a8 8 0 0 1-8-8Z" fill="#f6d7dd" />
      <path d="M36 62h28v14a8 8 0 0 1-8 8H44a8 8 0 0 1-8-8Z" fill="#eab8c2" />
      <path d="M38 40c0-8 4-13 12-13s12 5 12 13Z" fill="#cfa9b0" />
      <circle cx="45" cy="33" r="1.5" fill="#fff" />
      <circle cx="50" cy="31" r="1.5" fill="#fff" />
      <circle cx="55" cy="33" r="1.5" fill="#fff" />
      <rect x="40" y="46" width="5" height="36" rx="3" fill="#fff" opacity=".32" />
    </svg>
  ),
  rice: (
    <svg viewBox="0 0 100 100">
      {shadow}
      <path d="M26 58a24 12 0 0 1 48 0Z" fill="#f7f2e6" />
      <path d="M24 58h52a26 21 0 0 1-52 0Z" fill="#e8e0cf" />
      <path d="M24 58h52" stroke="#cbbfa2" strokeWidth="2" />
      <g fill="#dcd2b8">
        <ellipse cx="40" cy="54" rx="3" ry="1.4" transform="rotate(-20 40 54)" />
        <ellipse cx="50" cy="50" rx="3" ry="1.4" transform="rotate(10 50 50)" />
        <ellipse cx="60" cy="54" rx="3" ry="1.4" transform="rotate(25 60 54)" />
        <ellipse cx="45" cy="49" rx="3" ry="1.4" transform="rotate(-5 45 49)" />
        <ellipse cx="55" cy="49" rx="3" ry="1.4" transform="rotate(-30 55 49)" />
      </g>
    </svg>
  ),
  combo: (
    <svg viewBox="0 0 100 100">
      {shadow}
      <rect x="28" y="44" width="44" height="40" rx="4" fill="#6f9a3f" />
      <rect x="24" y="34" width="52" height="14" rx="4" fill="#5b8233" />
      <rect x="46" y="34" width="8" height="50" fill="#e0a52e" />
      <path d="M50 34c-9-13-24-4-8 5M50 34c9-13 24-4 8 5" fill="#e0a52e" />
      <circle cx="50" cy="35" r="4.5" fill="#c98416" />
    </svg>
  ),
}

export function getIcon(key) {
  return ICONS[key] || ICONS.combo
}
