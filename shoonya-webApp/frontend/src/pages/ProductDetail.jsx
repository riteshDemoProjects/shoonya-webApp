import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useCart } from '../context/CartContext'
import { formatINR } from '../data/catalogMeta'
import ProductMedia from '../components/ProductMedia'
import ProductCard from '../components/ProductCard'
import SectionHead from '../components/SectionHead'
import StarRating from '../components/StarRating'
import {
  ArrowRight,
  FlaskIcon,
  LeafIcon,
  PackageIcon,
  PotIcon,
  TruckIcon,
} from '../components/icons'

const BADGE_LABEL = { best: 'Bestseller', new: 'New', sale: 'Sale' }

// The same four claims the home page makes, in the same four marks. They used
// to be 🌿 🔬 🐄 🚚, which meant this row looked different on every OS.
const FEATURES = [
  { Icon: LeafIcon, text: 'No chemicals or preservatives' },
  { Icon: FlaskIcon, text: 'Third-party lab-tested' },
  { Icon: PotIcon, text: 'Traditional small-batch process' },
  { Icon: TruckIcon, text: 'Free shipping over ₹999' },
]

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { add, openCart } = useCart()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [vIdx, setVIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setErr(null)
    setVIdx(0)
    setQty(1)
    window.scrollTo({ top: 0 })
    api
      .getProduct(slug)
      .then((p) => {
        if (!alive) return
        setProduct(p)
        api
          .getProducts({ category: catKeyFromName(p.category) })
          .then((list) => alive && setRelated(list.filter((x) => x.slug !== p.slug).slice(0, 4)))
          .catch(() => {})
      })
      .catch((e) => alive && setErr(e.message))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [slug])

  if (loading) return <div className="pd pd--loading"><div className="spinner" /></div>
  if (err || !product) {
    return (
      <div className="empty-state empty-state--page">
        <div className="empty-state__mark">
          <PackageIcon aria-hidden="true" />
        </div>
        <h3>Product not found</h3>
        <p className="muted">{err || 'This item may no longer be available.'}</p>
        <Link to="/shop" className="btn btn--primary">Back to shop</Link>
      </div>
    )
  }

  const variant = product.variants[vIdx]
  const discount = variant.mrp ? Math.round((1 - variant.price / variant.mrp) * 100) : 0

  const handleAdd = (thenCheckout) => {
    add(product, variant, qty)
    if (thenCheckout) navigate('/checkout')
    else openCart()
  }

  return (
    <div className="pd">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${catKeyFromName(product.category)}`}>{product.category}</Link>
        <span>/</span>
        <span className="crumbs__current">{product.name}</span>
      </nav>

      <div className="pd__main">
        <div className="pd__media">
          <ProductMedia icon={product.icon} theme={product.theme} className="media--lg" />
          <div className="pd__thumbs">
            {product.variants.map((v, i) => (
              <button
                key={v.id}
                className={`pd__thumb ${i === vIdx ? 'is-active' : ''}`}
                onClick={() => setVIdx(i)}
                aria-label={v.label}
              >
                <ProductMedia icon={product.icon} theme={product.theme} />
              </button>
            ))}
          </div>
        </div>

        <div className="pd__info">
          <div className="pd__tags">
            <span className="pd__cat">{product.category}</span>
            {product.badge && (
              <span className={`tag tag--${product.badge}`}>{BADGE_LABEL[product.badge]}</span>
            )}
          </div>
          <h1>{product.name}</h1>
          <StarRating value={product.rating} reviews={product.reviews} />
          <p className="pd__desc">{product.description}</p>

          <div className="pd__price">
            <span className="price__now">{formatINR(variant.price)}</span>
            {variant.mrp && <span className="price__was">{formatINR(variant.mrp)}</span>}
            {discount > 0 && <span className="tag tag--off">Save {discount}%</span>}
            <span className="pd__tax">incl. of all taxes</span>
          </div>

          <div className="pd__field">
            <span className="pd__label">Size / Pack</span>
            <div className="pd__variants">
              {product.variants.map((v, i) => (
                <button
                  key={v.id}
                  className={`variant ${i === vIdx ? 'is-active' : ''}`}
                  onClick={() => setVIdx(i)}
                >
                  <span className="variant__label">{v.label}</span>
                  <span className="variant__price">{formatINR(v.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pd__buy">
            <div className="qty qty--lg">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase">+</button>
            </div>
            <button className="btn btn--primary btn--lg" onClick={() => handleAdd(false)}>
              Add to cart · {formatINR(variant.price * qty)}
            </button>
          </div>
          <button className="btn btn--accent btn--lg btn--block" onClick={() => handleAdd(true)}>
            Buy it now
          </button>

          <ul className="pd__features">
            {FEATURES.map(({ Icon, text }) => (
              <li key={text}>
                <Icon aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section" aria-labelledby="related-title">
          <SectionHead
            eyebrow="You may also like"
            title={`More from ${product.category}`}
            id="related-title"
            action={
              <Link to={`/shop?category=${catKeyFromName(product.category)}`} className="link-arrow">
                View all <ArrowRight aria-hidden="true" />
              </Link>
            }
          />
          <div className="grid grid--rail">
            {related.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// Categories come back keyed by slug from the API; derive the same slug the
// backend uses (lowercase, & -> and, spaces -> dashes) for filter links.
function catKeyFromName(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
