import { THEMES, getIcon } from '../data/catalogMeta'

export default function ProductMedia({ icon, theme, className = '' }) {
  return (
    <div
      className={`media ${className}`}
      style={{ background: THEMES[theme] || THEMES.combo }}
    >
      {getIcon(icon)}
    </div>
  )
}
