import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Route guard. Use it wrapping an element:
 *   <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
 * or as a layout route, where it renders the matched child via <Outlet />:
 *   <Route element={<RequireAuth />}>…</Route>
 *
 * While the stored token is being validated we render a spinner rather than
 * redirecting, otherwise a refresh on a protected page would bounce you to
 * the login screen before we know you're already signed in.
 */
export default function RequireAuth({ children }) {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="pd pd--loading">
        <div className="spinner" />
      </div>
    )
  }

  if (!isLoggedIn) {
    // `from` lets the login page send you back where you were headed.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children ?? <Outlet />
}
