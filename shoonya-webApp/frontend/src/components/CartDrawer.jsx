import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../context/CartContext'
import { formatINR } from '../data/catalogMeta'
import ProductMedia from './ProductMedia'
import { CloseIcon, TrashIcon, ArrowRight } from './icons'

export default function CartDrawer() {
  const { items, subtotal, count, isOpen, closeCart, setQty, remove } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeCart()
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeCart])

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

  const goCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <>
      <div
        className={`scrim ${isOpen ? 'is-open' : ''}`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside
        className={`drawer ${isOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        <div className="drawer__head">
          <h3>Your Cart {count > 0 && <span className="drawer__count">{count}</span>}</h3>
          <button className="icon-btn" onClick={closeCart} aria-label="Close cart">
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="drawer__empty">
            <div className="drawer__empty-mark">🧺</div>
            <p>Your cart is feeling light.</p>
            <button
              className="btn btn--primary"
              onClick={() => {
                closeCart()
                navigate('/shop')
              }}
            >
              Start shopping
            </button>
          </div>
        ) : (
          <>
            <div className="drawer__ship">
              {remaining > 0 ? (
                <p>
                  Add <strong>{formatINR(remaining)}</strong> more for <strong>free shipping</strong>
                </p>
              ) : (
                <p>🎉 You've unlocked <strong>free shipping!</strong></p>
              )}
              <div className="ship-bar">
                <span style={{ width: `${pct}%` }} />
              </div>
            </div>

            <ul className="drawer__items">
              {items.map((it) => (
                <li key={it.variantId} className="line">
                  <ProductMedia icon={it.icon} theme={it.theme} className="line__media" />
                  <div className="line__info">
                    <span className="line__name">{it.name}</span>
                    <span className="line__variant">{it.label}</span>
                    <div className="line__foot">
                      <div className="qty">
                        <button
                          onClick={() => setQty(it.variantId, it.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{it.qty}</span>
                        <button
                          onClick={() => setQty(it.variantId, it.qty + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="line__price">{formatINR(it.price * it.qty)}</span>
                    </div>
                  </div>
                  <button
                    className="line__remove"
                    onClick={() => remove(it.variantId)}
                    aria-label={`Remove ${it.name}`}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>

            <div className="drawer__foot">
              <div className="drawer__row">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="drawer__row drawer__row--muted">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
              </div>
              <div className="drawer__row drawer__row--total">
                <span>Total</span>
                <span>{formatINR(subtotal + shipping)}</span>
              </div>
              <button className="btn btn--primary btn--block" onClick={goCheckout}>
                Checkout <ArrowRight />
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
