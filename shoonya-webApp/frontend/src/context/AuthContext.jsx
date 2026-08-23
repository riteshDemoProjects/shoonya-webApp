import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api, getAuthToken, onUnauthorized, setAuthToken } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Start in a loading state only if there's a token worth validating —
  // otherwise anonymous visitors would see a needless flash of a spinner.
  const [loading, setLoading] = useState(() => Boolean(getAuthToken()))

  // Restore the session on boot: a stored token is only trustworthy if /me accepts it.
  useEffect(() => {
    if (!getAuthToken()) {
      setLoading(false)
      return undefined
    }
    let alive = true
    api
      .getMe()
      .then((me) => alive && setUser(me))
      .catch((err) => {
        // Only a 401 proves the token is bad. A network failure (status 0 —
        // typically the backend not up yet) must not throw away an otherwise
        // valid 7-day session; keep it and let the next request settle it.
        if (err?.status === 401) setAuthToken(null)
        if (alive) setUser(null)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  // If any request comes back 401 the token is already cleared; catch up the UI.
  useEffect(() => onUnauthorized(() => setUser(null)), [])

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password })
    setAuthToken(data.access_token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const data = await api.register(payload)
    setAuthToken(data.access_token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    setAuthToken(null)
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (patch) => {
    const updated = await api.updateMe(patch)
    setUser(updated)
    return updated
  }, [])

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    // The server invalidates every token issued before the change, including
    // the one we just used — so adopt the replacement it hands back, or the
    // next request would 401 and log this tab out.
    const data = await api.changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    })
    setAuthToken(data.access_token)
    setUser(data.user)
    return data.user
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isLoggedIn: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, loading, login, register, logout, updateProfile, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
