import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import {
  CartIcon,
  SearchIcon,
  MenuIcon,
  CloseIcon,
  UserIcon,
  PackageIcon,
  LogoutIcon,
} from './icons'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/shop?category=ghee', label: 'Ghee' },
  { to: '/shop?category=honey', label: 'Honey' },
  { to: '/shop?category=cold-pressed-oils', label: 'Oils' },
  { to: '/#story', label: 'Our Story' },
]

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || '🌿'

function AccountMenu({ open, setOpen }) {
  const { user, isLoggedIn, loading, logout } = useAuth()
  const navigate = useNavigate()
  const wrapRef = useRef(null)

  // Close on outside click / Escape — a dropdown you can't dismiss is a trap.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, setOpen])

  if (loading) {
    // Reserve the space so the header doesn't jump once the session resolves.
    return <div className="acct__placeholder" aria-hidden="true" />
  }

  if (!isLoggedIn) {
    return (
      <Link to="/login" className="acct__login" aria-label="Log in">
        <UserIcon />
        <span className="acct__login-text">Log in</span>
      </Link>
    )
  }

  const signOut = () => {
    setOpen(false)
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="acct" ref={wrapRef}>
      <button
        className="acct__btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.full_name}`}
      >
        {initials(user.full_name)}
      </button>

      {open && (
        <div className="acct__menu" role="menu">
          <div className="acct__head">
            <strong>{user.full_name}</strong>
            <span className="muted">{user.email}</span>
          </div>
          <Link to="/account/orders" className="acct__item" role="menuitem" onClick={() => setOpen(false)}>
            <PackageIcon /> My orders
          </Link>
          <Link to="/account/profile" className="acct__item" role="menuitem" onClick={() => setOpen(false)}>
            <UserIcon /> Profile
          </Link>
          <button className="acct__item acct__item--out" role="menuitem" onClick={signOut}>
            <LogoutIcon /> Log out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const { count, openCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [acctOpen, setAcctOpen] = useState(false)
  const [q, setQ] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setAcctOpen(false)
  }, [location.pathname, location.search, location.hash])

  const submitSearch = (e) => {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/shop?search=${encodeURIComponent(term)}` : '/shop')
  }

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header__inner">
        <button
          className="header__burger"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <Link to="/" className="brand" aria-label="Shoonya Farms home">
          {/* The badge contains the wordmark, so it needs no text beside it.
              width/height are the rendered size, reserving the box before CSS
              lands; styles.css owns the real dimensions. */}
          <img src="/logo.svg" alt="Shoonya Farms" className="brand__mark" width="44" height="46" />
        </Link>

        <nav className={`nav ${menuOpen ? 'is-open' : ''}`}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          <form className="search" onSubmit={submitSearch} role="search">
            <SearchIcon className="search__icon" />
            <input
              type="search"
              placeholder="Search staples…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search products"
            />
          </form>
          <AccountMenu open={acctOpen} setOpen={setAcctOpen} />
          <button className="cart-btn" onClick={openCart} aria-label={`Cart, ${count} items`}>
            <CartIcon />
            {count > 0 && <span className="cart-btn__count">{count}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}
