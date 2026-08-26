import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { lockScroll, unlockScroll } from "../scrollLock";
import { initials } from "../initials";
import {
  CartIcon,
  SearchIcon,
  MenuIcon,
  CloseIcon,
  UserIcon,
  PackageIcon,
  LogoutIcon,
} from "./icons";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop" },
  { to: "/shop?category=ghee", label: "Ghee" },
  { to: "/shop?category=honey", label: "Honey" },
  { to: "/shop?category=cold-pressed-oils", label: "Oils" },
  { to: "/story", label: "Our Story" },
];

function AccountMenu({ open, setOpen }) {
  const { user, isLoggedIn, loading, logout } = useAuth();
  const navigate = useNavigate();
  const wrapRef = useRef(null);

  // Close on outside click / Escape — a dropdown you can't dismiss is a trap.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  if (loading) {
    // Reserve the space so the header doesn't jump once the session resolves.
    return <div className="acct__placeholder" aria-hidden="true" />;
  }

  if (!isLoggedIn) {
    return (
      <Link to="/login" className="acct__login" aria-label="Log in">
        <UserIcon aria-hidden="true" />
        <span className="acct__login-text">Log in</span>
      </Link>
    );
  }

  const signOut = () => {
    setOpen(false);
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="acct" ref={wrapRef}>
      <button
        className="acct__btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.full_name}`}
      >
        {initials(user.full_name) || <UserIcon />}
      </button>

      {open && (
        <div className="acct__menu" role="menu">
          <div className="acct__head">
            <strong>{user.full_name}</strong>
            <span className="muted">{user.email}</span>
          </div>
          <Link
            to="/account/orders"
            className="acct__item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <PackageIcon aria-hidden="true" /> My orders
          </Link>
          <Link
            to="/account/profile"
            className="acct__item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <UserIcon aria-hidden="true" /> Profile
          </Link>
          <button
            className="acct__item acct__item--out"
            role="menuitem"
            onClick={signOut}
          >
            <LogoutIcon aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { count, openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [q, setQ] = useState("");
  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --nav-top is the mobile menu panel's fixed anchor: the header's measured
  // bottom edge, *including* the announce bar above it. The header is sticky
  // below the announce bar, so its bottom is announce-height + 64px at the top
  // of the page but only var(--header-h) once the announce bar has scrolled
  // away — measuring beats assuming, but it has to be re-measured as that gap
  // closes.
  //
  // Scroll is in the listener list because the header's *position* changes
  // while its size does not, so ResizeObserver alone never fires for it — the
  // anchor would stay pinned at its first-paint value and the panel would open
  // a scrim-coloured gap below the header. menuOpen is a dependency so the
  // value is always freshly measured at the moment the panel appears.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return undefined;
    let frame = 0;
    const sync = () => {
      const bottom = header.getBoundingClientRect().bottom;
      if (bottom > 0)
        document.documentElement.style.setProperty(
          "--nav-top",
          `${Math.round(bottom)}px`,
        );
    };
    // rAF-coalesced: scroll fires far more often than layout needs updating.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(header);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("orientationchange", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("orientationchange", onScroll);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setAcctOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // Lock body scroll while menu is open
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    lockScroll();
    return () => {
      document.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [menuOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    setMenuOpen(false);
    navigate(term ? `/shop?search=${encodeURIComponent(term)}` : "/shop");
  };

  return (
    <>
      <header className={`header ${scrolled ? "is-scrolled" : ""}`} ref={headerRef}>
        {/* One row: burger (touch only), brand, nav, actions. */}
        <div className="header__inner">
          <button
            className="header__burger icon-btn"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onTouchStart={(e) => {
              // Fire immediately on touch — iOS Safari delays synthetic click
              // events on elements it deems non-interactive. onTouchStart fires
              // before any delay logic and lets the menu respond instantly.
              e.preventDefault(); // stops the subsequent click from double-firing
              setMenuOpen((v) => !v);
            }}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <CloseIcon aria-hidden="true" />
            ) : (
              <MenuIcon aria-hidden="true" />
            )}
          </button>

          <Link to="/" className="brand" aria-label="Shoonya Farms home">
            <img
              src="/logo.svg"
              alt="Shoonya Farms"
              className="brand__mark"
              width="40"
              height="42"
            />
          </Link>

          <nav className="nav nav--desktop">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `nav__link ${isActive ? "is-active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            <form className="search" onSubmit={submitSearch} role="search">
              <SearchIcon className="search__icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search staples…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search products"
              />
            </form>
            <AccountMenu open={acctOpen} setOpen={setAcctOpen} />
            <button
              className="cart-btn"
              onClick={openCart}
              aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <CartIcon aria-hidden="true" />
              {count > 0 && <span className="cart-btn__count">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {/*
        nav--mobile and nav__scrim are siblings of <header>, NOT children.

        iOS Safari bug: any element that has backdrop-filter applied (even via a
        ::before pseudo-element) creates a new compositing layer. Any
        `position: fixed` descendant of that layer is clipped to the ancestor's
        bounds and positioned relative to it — not the viewport. This made the
        mobile nav panel invisible (clipped away below the header) on real
        iPhones, even though it worked fine in Chrome DevTools device mode.

        Moving both elements outside <header> entirely is the correct fix.
        z-index: header=50, nav__scrim=40, nav--mobile=51 keeps the layering
        correct: scrim sits below the header, panel sits above it.
      */}
      <nav
        className={`nav nav--mobile ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        {/* Search moves out of the header bar and into the panel on mobile. */}
        <form
          className="search nav__search"
          onSubmit={submitSearch}
          role="search"
        >
          <SearchIcon className="search__icon" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search staples…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            tabIndex={menuOpen ? 0 : -1}
            aria-label="Search products"
          />
        </form>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `nav__link ${isActive ? "is-active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div
        className={`nav__scrim ${menuOpen ? "is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
    </>
  );
}
