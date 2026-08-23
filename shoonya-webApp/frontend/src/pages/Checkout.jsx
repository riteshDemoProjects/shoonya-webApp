import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useCart, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatINR } from '../data/catalogMeta'
import ProductMedia from '../components/ProductMedia'
import { ArrowRight } from '../components/icons'

const FIELDS = [
  { name: 'customer_name', label: 'Full name', type: 'text', placeholder: 'Priya Sharma', span: 2 },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'priya@email.com' },
  { name: 'phone', label: 'Phone', type: 'tel', placeholder: '98765 43210' },
  { name: 'address', label: 'Address', type: 'text', placeholder: 'House / flat, street, area', span: 2 },
  { name: 'city', label: 'City', type: 'text', placeholder: 'Bengaluru' },
  { name: 'state', label: 'State', type: 'text', placeholder: 'Karnataka' },
  { name: 'pincode', label: 'Pincode', type: 'text', placeholder: '560001' },
]

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  // This route sits behind RequireAuth, so `user` is always present here.
  const [form, setForm] = useState(() => ({
    customer_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    payment_method: 'cod',
  }))
  // Offer to remember the address by default only when there's nothing saved
  // yet — never silently overwrite an address the user deliberately set.
  const [saveAddress, setSaveAddress] = useState(() => !user?.address)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="empty-state empty-state--page">
        <div className="empty-state__mark">🧺</div>
        <h3>Your cart is empty</h3>
        <p className="muted">Add a few staples before heading to checkout.</p>
        <Link to="/shop" className="btn btn--primary">Browse products</Link>
      </div>
    )
  }

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.customer_name.trim()) e.customer_name = 'Required'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!/^[0-9+\-\s]{8,15}$/.test(form.phone)) e.phone = 'Enter a valid phone'
    if (!form.address.trim()) e.address = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.state.trim()) e.state = 'Required'
    if (!/^[1-9][0-9]{5}$/.test(form.pincode.trim())) e.pincode = '6-digit pincode'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    setApiError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      const order = await api.createOrder({
        ...form,
        save_address: saveAddress,
        items: items.map((i) => ({ variant_id: i.variantId, quantity: i.qty })),
      })
      clear()
      navigate(`/order/${order.order_number}`, { state: { order } })
    } catch (err) {
      setApiError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="checkout">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <span className="crumbs__current">Checkout</span>
      </nav>

      <h1 className="checkout__title">Checkout</h1>

      <div className="checkout__grid">
        <form className="checkout__form" onSubmit={submit} noValidate>
          <section className="panel">
            <h2>Contact &amp; delivery</h2>
            <p className="checkout__as muted">
              Ordering as <strong>{user?.full_name}</strong> ·{' '}
              <Link to="/account/profile" className="auth__link">Manage profile</Link>
            </p>
            <div className="fields">
              {FIELDS.map((f) => (
                <label
                  key={f.name}
                  className={`field ${f.span === 2 ? 'field--wide' : ''} ${errors[f.name] ? 'has-error' : ''}`}
                >
                  <span>{f.label}</span>
                  <input
                    type={f.type}
                    value={form[f.name]}
                    placeholder={f.placeholder}
                    onChange={(e) => set(f.name, e.target.value)}
                    autoComplete={AUTOCOMPLETE[f.name]}
                  />
                  {errors[f.name] && <em className="field__err">{errors[f.name]}</em>}
                </label>
              ))}
            </div>
            <label className="checkout__save">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
              />
              <span>Save these details to my profile for next time</span>
            </label>
          </section>

          <section className="panel">
            <h2>Payment</h2>
            <div className="pay">
              <label className={`pay__opt ${form.payment_method === 'cod' ? 'is-active' : ''}`}>
                <input
                  type="radio"
                  name="pay"
                  checked={form.payment_method === 'cod'}
                  onChange={() => set('payment_method', 'cod')}
                />
                <span className="pay__mark" />
                <span>
                  <strong>Cash on Delivery</strong>
                  <em>Pay when your order arrives.</em>
                </span>
              </label>
              <label className={`pay__opt ${form.payment_method === 'online' ? 'is-active' : ''}`}>
                <input
                  type="radio"
                  name="pay"
                  checked={form.payment_method === 'online'}
                  onChange={() => set('payment_method', 'online')}
                />
                <span className="pay__mark" />
                <span>
                  <strong>Online Payment</strong>
                  <em>UPI / cards (demo — no real charge).</em>
                </span>
              </label>
            </div>
          </section>

          {apiError && <div className="alert">⚠️ {apiError}</div>}

          <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting}>
            {submitting ? 'Placing order…' : <>Place order · {formatINR(total)} <ArrowRight /></>}
          </button>
          <p className="checkout__secure">🔒 This is a demo store — no real payment is processed.</p>
        </form>

        <aside className="summary">
          <h2>Order summary</h2>
          <ul className="summary__items">
            {items.map((it) => (
              <li key={it.variantId}>
                <div className="summary__media">
                  <ProductMedia icon={it.icon} theme={it.theme} />
                  <span className="summary__qty">{it.qty}</span>
                </div>
                <div className="summary__info">
                  <span className="summary__name">{it.name}</span>
                  <span className="summary__variant">{it.label}</span>
                </div>
                <span className="summary__price">{formatINR(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="summary__totals">
            <div className="summary__row">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="summary__row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
            </div>
            <div className="summary__row summary__row--total">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
          {shipping === 0 && <p className="summary__free">🎉 You qualified for free shipping!</p>}
        </aside>
      </div>
    </div>
  )
}

const AUTOCOMPLETE = {
  customer_name: 'name',
  email: 'email',
  phone: 'tel',
  address: 'street-address',
  city: 'address-level2',
  state: 'address-level1',
  pincode: 'postal-code',
}
