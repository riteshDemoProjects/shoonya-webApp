import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useCart } from '../context/CartContext'
import { formatINR, iconTheme } from '../data/catalogMeta'
import ProductMedia from '../components/ProductMedia'
import { ChevronDown } from '../components/icons'

const PAY_LABEL = { cod: 'Cash on Delivery', online: 'Online Payment (demo)' }

// Anything not yet delivered is still "on its way" and belongs in Pending.
const isPending = (order) => order.status !== 'delivered'

const formatDate = (iso) => {
  // SQLite hands back naive UTC timestamps; mark them as UTC so the date
  // doesn't shift backwards for users east of Greenwich.
  const hasZone = /[Zz]|[+-]\d{2}:?\d{2}$/.test(iso)
  const d = new Date(hasZone ? iso : `${iso}Z`)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function OrderCard({ order, defaultOpen = false, onReceived }) {
  const [open, setOpen] = useState(defaultOpen)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState(null)
  const { toast } = useCart()
  const pending = isPending(order)
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0)
  const panelId = `order-panel-${order.order_number}`

  const confirmReceipt = async () => {
    setError(null)
    setConfirming(true)
    try {
      const updated = await api.receiveOrder(order.order_number)
      toast('Thanks — moved to your order history. 🌿')
      // Re-renders this card into the history list, so don't clear `confirming`
      // afterwards: this instance is on its way out.
      onReceived(updated)
    } catch (e) {
      setError(e.message)
      setConfirming(false)
    }
  }

  return (
    <article className={`order ${open ? 'is-open' : ''}`}>
      {/* The whole row is clickable for convenience, but the real control is
          the toggle button below — a <button> may not wrap block content. */}
      <div className="order__head" onClick={() => setOpen((v) => !v)}>
        <div className="order__thumbs" aria-hidden="true">
          {order.items.slice(0, 3).map((it) => (
            <ProductMedia key={it.id} icon={it.icon} theme={iconTheme(it.icon)} />
          ))}
          {order.items.length > 3 && (
            <span className="order__more">+{order.items.length - 3}</span>
          )}
        </div>

        <div className="order__info">
          <div className="order__line">
            <strong className="order__number">{order.order_number}</strong>
            <span className={`order__status order__status--${pending ? 'pending' : 'done'}`}>
              {pending ? '🚚 On the way' : '✅ Delivered'}
            </span>
          </div>
          <span className="muted order__meta">
            {formatDate(order.created_at)} · {itemCount} item{itemCount === 1 ? '' : 's'} ·{' '}
            {PAY_LABEL[order.payment_method] || order.payment_method}
          </span>
        </div>

        <div className="order__right">
          <span className="order__total">{formatINR(order.total)}</span>
          {/* No onClick here: the click bubbles to the row handler above, which
              keeps mouse and keyboard on exactly one code path. */}
          <button
            type="button"
            className="order__toggle"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`${open ? 'Hide' : 'Show'} details for order ${order.order_number}`}
          >
            <ChevronDown className="order__chev" />
          </button>
        </div>
      </div>

      {open && (
        <div className="order__body" id={panelId}>
          <ul className="order__items">
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

          <div className="order__foot">
            <div className="order__ship">
              <h4>Delivery address</h4>
              <address>
                <strong>{order.customer_name}</strong><br />
                {order.address}<br />
                {order.city}, {order.state} {order.pincode}<br />
                📞 {order.phone}
              </address>
            </div>

            <div className="order__totals">
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
              {pending && (
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={confirmReceipt}
                  disabled={confirming}
                >
                  {confirming ? 'Saving…' : 'Mark as received'}
                </button>
              )}
              {error && <div className="alert">⚠️ {error}</div>}
              <Link to={`/order/${order.order_number}`} className="btn btn--ghost btn--block">
                View full details
              </Link>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export default function AccountOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let alive = true
    api
      .getMyOrders()
      .then((data) => alive && setOrders(data))
      .catch((e) => alive && setErr(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const { pending, history } = useMemo(
    () => ({
      pending: orders.filter(isPending),
      history: orders.filter((o) => !isPending(o)),
    }),
    [orders],
  )

  // Swap in the server's updated copy so the card moves from Pending to
  // history without a refetch.
  const handleReceived = useCallback((updated) => {
    setOrders((prev) =>
      prev.map((o) => (o.order_number === updated.order_number ? updated : o)),
    )
  }, [])

  if (loading) {
    return (
      <div className="account__loading">
        <div className="spinner" />
      </div>
    )
  }

  if (err) {
    return (
      <div className="empty-state">
        <div className="empty-state__mark">⚠️</div>
        <h3>Couldn't load your orders</h3>
        <p className="muted">{err}</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__mark">🧺</div>
        <h3>No orders yet</h3>
        <p className="muted">
          When you place your first order it'll show up here, along with its status.
        </p>
        <Link to="/shop" className="btn btn--primary">Start shopping</Link>
      </div>
    )
  }

  return (
    <div className="orders">
      <section className="orders__section">
        <header className="orders__head">
          <h2>Pending orders</h2>
          <span className="orders__count">{pending.length}</span>
        </header>
        {pending.length === 0 ? (
          <p className="orders__none muted">
            Nothing on its way right now — every order has been delivered. 🌿
          </p>
        ) : (
          <div className="orders__list">
            {pending.map((o, i) => (
              // Expand the newest pending order — usually the one you came to check.
              <OrderCard
                key={o.order_number}
                order={o}
                defaultOpen={i === 0}
                onReceived={handleReceived}
              />
            ))}
          </div>
        )}
      </section>

      <section className="orders__section">
        <header className="orders__head">
          <h2>Order history</h2>
          <span className="orders__count">{history.length}</span>
        </header>
        {history.length === 0 ? (
          <p className="orders__none muted">
            No completed orders yet. Open a pending order and tap “Mark as received”
            once it arrives, and it'll move here.
          </p>
        ) : (
          <div className="orders__list">
            {history.map((o) => (
              <OrderCard key={o.order_number} order={o} onReceived={handleReceived} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
