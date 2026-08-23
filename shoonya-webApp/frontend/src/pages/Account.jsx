import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogoutIcon, PackageIcon, UserIcon } from '../components/icons'

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || '🌿'

export default function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const signOut = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="account">
      <div className="account__grid">
        <aside className="account__side">
          <div className="account__card panel">
            <div className="account__avatar" aria-hidden="true">
              {initials(user?.full_name)}
            </div>
            <div className="account__who">
              <strong>{user?.full_name}</strong>
              <span className="muted">{user?.email}</span>
            </div>
          </div>

          <nav className="account__nav" aria-label="Account sections">
            <NavLink
              to="/account/orders"
              className={({ isActive }) =>
                `account__tab ${isActive ? 'is-active' : ''}`
              }
            >
              <PackageIcon />
              <span>My orders</span>
            </NavLink>
            <NavLink
              to="/account/profile"
              className={({ isActive }) =>
                `account__tab ${isActive ? 'is-active' : ''}`
              }
            >
              <UserIcon />
              <span>Profile</span>
            </NavLink>
            <button type="button" className="account__tab account__tab--out" onClick={signOut}>
              <LogoutIcon />
              <span>Log out</span>
            </button>
          </nav>
        </aside>

        <section className="account__main">
          <Outlet />
        </section>
      </div>
    </div>
  )
}
