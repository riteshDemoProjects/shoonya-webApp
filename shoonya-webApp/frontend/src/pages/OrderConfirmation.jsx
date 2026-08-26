import { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { api } from '../api'
import { formatINR, iconTheme } from '../data/catalogMeta'
import ProductMedia from '../components/ProductMedia'
import { ArrowRight, CheckIcon, SearchIcon, TruckIcon } from '../components/icons'

const PAY_LABEL = { cod: 'Cash on Delivery', online: 'Online Payment (demo)' }

export default function OrderConfirmation() {
  const { orderNumber } = useParams()
  const location = useLocation()
  // Checkout hands the freshly created order over via navigate() state, which
  // saves a round trip. It's only good for *that* order number though — guard
  // it, or navigating to a different order would render the previous one.
  const preloaded =
    location.state?.order?.order_number === orderNumber ? location.state.order : null
  const [order, setOrder] = useState(preloaded)
  const [loading, setLoading] = useState(!preloaded)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (preloaded) {
      setOrder(preloaded)
      setErr(null)
      setLoading(false)
      window.scrollTo({ top: 0 })
      return undefined
    }
    let alive = true
    // Drop the previous order so a stale one can't paint under the new URL.
    setOrder(null)
    setLoading(true)
    setErr(null)
    api
      .getOrder(orderNumber)
      .then((o) => alive && setOrder(o))
      .catch((e) => alive && setErr(e.message))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [orderNumber, preloaded])

  if (loading) return <div className="pd pd--loading"><div className="spinner" /></div>
  if (err || !order) {
    return (
      <div className="empty-state empty-state--page">
        <div className="empty-state__mark">
          <SearchIcon />
        </div>
        <h3>Order not found</h3>
        <p className="muted">{err || `We couldn't find order ${orderNumber}.`}</p>
        <Link to="/shop" className="btn btn--primary">Continue shopping</Link>
      </div>
    )
  }

  return (
    <div className="confirm">
      <div className="confirm__hero">
        <div className="confirm__check"><CheckIcon /></div>
        <span className="eyebrow">Order confirmed</span>
        <h1>Thank you, {order.customer_name.split(' ')[0]}</h1>
        <p>
          Your order <strong>{order.order_number}</strong> is confirmed. A confirmation has been
          sent to <strong>{order.email}</strong>.
        </p>
        <div className="confirm__meta">
          <span>Status: <strong>{cap(order.status)}</strong></span>
          <span>{PAY_LABEL[order.payment_method] || order.payment_method}</span>
        </div>
      </div>

      <div className="confirm__grid">
        <section className="panel">
          <h2>Order details</h2>
          <ul className="confirm__items">
            {order.items.map((it) => (
              <li key={it.id}>
                <div className="summary__media">
                  <ProductMedia icon={it.icon} theme={iconTheme(it.icon)} />
                  <span className="summary__qty">{it.quantity}</span>
                </div>
                <div className="summary__info">
                  <span className="summary__name">{it.product_name}</span>
                  <span className="summary__variant">{it.variant_label}</span>
                </div>
                <span className="summary__price">{formatINR(it.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="summary__totals">
            <div className="summary__row">
              <span>Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            <div className="summary__row">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'Free' : formatINR(order.shipping)}</span>
            </div>
            <div className="summary__row summary__row--total">
              <span>Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>
        </section>

        <aside className="panel confirm__ship">
          <h2>Delivery address</h2>
          <address>
            <strong>{order.customer_name}</strong><br />
            {order.address}<br />
            {order.city}, {order.state} {order.pincode}<br />
            Phone {order.phone}
          </address>
          <div className="confirm__eta">
            <span className="confirm__eta-icon">
              <TruckIcon />
            </span>
            <div>
              <strong>Estimated delivery</strong>
              <p>3–6 business days · Free tracking updates over email</p>
            </div>
          </div>
          <Link to="/shop" className="btn btn--primary btn--block">
            Continue shopping <ArrowRight />
          </Link>
          <Link to="/account/orders" className="btn btn--ghost btn--block confirm__orders-link">
            View all my orders
          </Link>
        </aside>
      </div>
    </div>
  )
}

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
