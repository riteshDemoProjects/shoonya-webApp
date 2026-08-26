import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const DETAIL_FIELDS = [
  { name: 'full_name', label: 'Full name', type: 'text', placeholder: 'Priya Sharma', wide: true, autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'priya@email.com', autoComplete: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel', placeholder: '98765 43210', autoComplete: 'tel' },
]

const ADDRESS_FIELDS = [
  { name: 'address', label: 'Address', type: 'text', placeholder: 'House / flat, street, area', wide: true, autoComplete: 'street-address' },
  { name: 'city', label: 'City', type: 'text', placeholder: 'Bengaluru', autoComplete: 'address-level2' },
  { name: 'state', label: 'State', type: 'text', placeholder: 'Karnataka', autoComplete: 'address-level1' },
  { name: 'pincode', label: 'Pincode', type: 'text', placeholder: '560001', autoComplete: 'postal-code' },
]

function Fields({ defs, values, errors, onChange }) {
  return (
    <div className="fields">
      {defs.map((f) => (
        <label
          key={f.name}
          className={`field ${f.wide ? 'field--wide' : ''} ${errors[f.name] ? 'has-error' : ''}`}
        >
          <span>{f.label}</span>
          <input
            type={f.type}
            value={values[f.name] ?? ''}
            placeholder={f.placeholder}
            autoComplete={f.autoComplete}
            onChange={(e) => onChange(f.name, e.target.value)}
          />
          {errors[f.name] && <em className="field__err">{errors[f.name]}</em>}
        </label>
      ))}
    </div>
  )
}

export default function AccountProfile() {
  const { user, updateProfile, changePassword } = useAuth()
  const { toast } = useCart()

  const [details, setDetails] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [address, setAddress] = useState({
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  })
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })

  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(null) // 'details' | 'address' | 'password'
  const [alerts, setAlerts] = useState({})

  const clearError = (name) =>
    errors[name] && setErrors((e) => ({ ...e, [name]: undefined }))

  const setDetail = (name, value) => {
    setDetails((d) => ({ ...d, [name]: value }))
    clearError(name)
  }
  const setAddr = (name, value) => {
    setAddress((a) => ({ ...a, [name]: value }))
    clearError(name)
  }
  const setPassword = (name, value) => {
    setPwd((p) => ({ ...p, [name]: value }))
    clearError(name)
  }

  // --- personal details -----------------------------------------------------
  const saveDetails = async (ev) => {
    ev.preventDefault()
    const e = {}
    if (details.full_name.trim().length < 2) e.full_name = 'Enter your full name'
    if (!/^\S+@\S+\.\S+$/.test(details.email)) e.email = 'Enter a valid email'
    if (details.phone && !/^[0-9+\-\s]{8,15}$/.test(details.phone)) e.phone = 'Enter a valid phone'
    setErrors((prev) => ({ ...prev, ...e }))
    if (Object.keys(e).length) return

    setAlerts((a) => ({ ...a, details: null }))
    setBusy('details')
    try {
      await updateProfile({
        full_name: details.full_name.trim(),
        email: details.email.trim(),
        phone: details.phone.trim(),
      })
      toast('Profile updated')
    } catch (err) {
      setAlerts((a) => ({ ...a, details: err.message }))
    } finally {
      setBusy(null)
    }
  }

  // --- saved address --------------------------------------------------------
  const saveAddress = async (ev) => {
    ev.preventDefault()
    const e = {}
    // The whole address is optional, but a partially filled one can't pre-fill
    // checkout usefully, so validate the pieces that were provided.
    const touched = Object.values(address).some((v) => v.trim())
    if (touched) {
      if (!address.address.trim()) e.address = 'Required'
      if (!address.city.trim()) e.city = 'Required'
      if (!address.state.trim()) e.state = 'Required'
      if (!/^[1-9][0-9]{5}$/.test(address.pincode.trim())) e.pincode = '6-digit pincode'
    }
    setErrors((prev) => ({ ...prev, ...e }))
    if (Object.keys(e).length) return

    setAlerts((a) => ({ ...a, address: null }))
    setBusy('address')
    try {
      await updateProfile({
        address: address.address.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
      })
      toast('Delivery address saved')
    } catch (err) {
      setAlerts((a) => ({ ...a, address: err.message }))
    } finally {
      setBusy(null)
    }
  }

  // --- password ------------------------------------------------------------
  const savePassword = async (ev) => {
    ev.preventDefault()
    const e = {}
    if (!pwd.current) e.current = 'Required'
    if (pwd.next.length < 8) e.next = 'At least 8 characters'
    if (pwd.confirm !== pwd.next) e.confirm = 'Passwords do not match'
    setErrors((prev) => ({ ...prev, ...e }))
    if (Object.keys(e).length) return

    setAlerts((a) => ({ ...a, password: null }))
    setBusy('password')
    try {
      await changePassword(pwd.current, pwd.next)
      setPwd({ current: '', next: '', confirm: '' })
      toast('Password changed — other devices signed out')
    } catch (err) {
      setAlerts((a) => ({ ...a, password: err.message }))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="profile">
      <form className="panel" onSubmit={saveDetails} noValidate>
        <h2>Personal details</h2>
        <Fields defs={DETAIL_FIELDS} values={details} errors={errors} onChange={setDetail} />
        {alerts.details && <div className="alert">{alerts.details}</div>}
        <div className="profile__actions">
          <button type="submit" className="btn btn--primary" disabled={busy === 'details'}>
            {busy === 'details' ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <form className="panel" onSubmit={saveAddress} noValidate>
        <h2>Saved delivery address</h2>
        <p className="profile__hint muted">
          We'll use this to pre-fill your details at checkout.
        </p>
        <Fields defs={ADDRESS_FIELDS} values={address} errors={errors} onChange={setAddr} />
        {alerts.address && <div className="alert">{alerts.address}</div>}
        <div className="profile__actions">
          <button type="submit" className="btn btn--primary" disabled={busy === 'address'}>
            {busy === 'address' ? 'Saving…' : 'Save address'}
          </button>
        </div>
      </form>

      <form className="panel" onSubmit={savePassword} noValidate>
        <h2>Change password</h2>
        <div className="fields">
          <label className={`field field--wide ${errors.current ? 'has-error' : ''}`}>
            <span>Current password</span>
            <input
              type="password"
              value={pwd.current}
              placeholder="••••••••"
              autoComplete="current-password"
              onChange={(e) => setPassword('current', e.target.value)}
            />
            {errors.current && <em className="field__err">{errors.current}</em>}
          </label>
          <label className={`field ${errors.next ? 'has-error' : ''}`}>
            <span>New password</span>
            <input
              type="password"
              value={pwd.next}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              onChange={(e) => setPassword('next', e.target.value)}
            />
            {errors.next && <em className="field__err">{errors.next}</em>}
          </label>
          <label className={`field ${errors.confirm ? 'has-error' : ''}`}>
            <span>Confirm new password</span>
            <input
              type="password"
              value={pwd.confirm}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              onChange={(e) => setPassword('confirm', e.target.value)}
            />
            {errors.confirm && <em className="field__err">{errors.confirm}</em>}
          </label>
        </div>
        {alerts.password && <div className="alert">{alerts.password}</div>}
        <div className="profile__actions">
          <button type="submit" className="btn btn--primary" disabled={busy === 'password'}>
            {busy === 'password' ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  )
}
