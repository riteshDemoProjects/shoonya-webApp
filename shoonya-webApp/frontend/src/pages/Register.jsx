import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight } from '../components/icons'

const empty = { full_name: '', email: '', phone: '', password: '', confirm: '' }

export default function Register() {
  const { register, isLoggedIn, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const dest = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/account/orders'

  // A stored token is still being validated — wait rather than flashing the
  // signup form at someone who turns out to be signed in already.
  if (loading) {
    return (
      <div className="pd pd--loading">
        <div className="spinner" />
      </div>
    )
  }

  if (isLoggedIn) return <Navigate to={dest} replace />

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (form.full_name.trim().length < 2) e.full_name = 'Enter your full name'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
    if (form.phone && !/^[0-9+\-\s]{8,15}$/.test(form.phone)) e.phone = 'Enter a valid phone'
    if (form.password.length < 8) e.password = 'At least 8 characters'
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    setApiError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      })
      navigate(dest, { replace: true })
    } catch (err) {
      setApiError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__card panel">
        <div className="auth__head">
          <span className="eyebrow">Join the farm</span>
          <h1>Create account</h1>
          <p className="muted">
            Track your orders and check out faster next time.
          </p>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="fields fields--single">
            <label className={`field ${errors.full_name ? 'has-error' : ''}`}>
              <span>Full name</span>
              <input
                type="text"
                value={form.full_name}
                placeholder="Priya Sharma"
                autoComplete="name"
                onChange={(e) => set('full_name', e.target.value)}
              />
              {errors.full_name && <em className="field__err">{errors.full_name}</em>}
            </label>

            <label className={`field ${errors.email ? 'has-error' : ''}`}>
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                placeholder="priya@email.com"
                autoComplete="email"
                onChange={(e) => set('email', e.target.value)}
              />
              {errors.email && <em className="field__err">{errors.email}</em>}
            </label>

            <label className={`field ${errors.phone ? 'has-error' : ''}`}>
              <span>Phone <em className="field__opt">optional</em></span>
              <input
                type="tel"
                value={form.phone}
                placeholder="98765 43210"
                autoComplete="tel"
                onChange={(e) => set('phone', e.target.value)}
              />
              {errors.phone && <em className="field__err">{errors.phone}</em>}
            </label>

            <label className={`field ${errors.password ? 'has-error' : ''}`}>
              <span>Password</span>
              <input
                type="password"
                value={form.password}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                onChange={(e) => set('password', e.target.value)}
              />
              {errors.password && <em className="field__err">{errors.password}</em>}
            </label>

            <label className={`field ${errors.confirm ? 'has-error' : ''}`}>
              <span>Confirm password</span>
              <input
                type="password"
                value={form.confirm}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                onChange={(e) => set('confirm', e.target.value)}
              />
              {errors.confirm && <em className="field__err">{errors.confirm}</em>}
            </label>
          </div>

          {apiError && <div className="alert">{apiError}</div>}

          <button
            type="submit"
            className="btn btn--primary btn--lg btn--block"
            disabled={submitting}
          >
            {submitting ? 'Creating account…' : <>Create account <ArrowRight /></>}
          </button>
        </form>

        <p className="auth__alt">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="auth__link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
