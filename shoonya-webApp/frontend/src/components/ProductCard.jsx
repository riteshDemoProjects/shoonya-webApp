import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatINR } from '../data/catalogMeta'
import ProductMedia from './ProductMedia'
import StarRating from './StarRating'
import { PlusIcon, CheckIcon } from './icons'

const BADGE_LABEL = { best: 'Bestseller', new: 'New', sale: 'Sale' }

export default function ProductCard({ product }) {
  const { add } = useCart()
  const [vIdx, setVIdx] = useState(0)
  const [added, setAdded] = useState(false)
  const variant = product.variants[vIdx]
  const discount = variant.mrp
    ? Math.round((1 - variant.price / variant.mrp) * 100)
    : 0

  const handleAdd = () => {
    add(product, variant)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="card">
      <div className="card__badges">
        {product.badge && (
          <span className={`tag tag--${product.badge}`}>{BADGE_LABEL[product.badge]}</span>
        )}
        {discount > 0 && <span className="tag tag--off">{discount}% off</span>}
      </div>

      <Link to={`/product/${product.slug}`} className="card__medialink" aria-label={product.name}>
        <ProductMedia icon={product.icon} theme={product.theme} />
      </Link>

      <div className="card__body">
        <span className="card__cat">{product.category}</span>
        <Link to={`/product/${product.slug}`} className="card__name">
          {product.name}
        </Link>
        <StarRating value={product.rating} reviews={product.reviews} />

        {product.variants.length > 1 && (
          <div className="card__sizes" role="group" aria-label="Choose size">
            {product.variants.map((v, i) => (
              <button
                key={v.id}
                type="button"
                className={`size ${i === vIdx ? 'is-active' : ''}`}
                onClick={() => setVIdx(i)}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="card__foot">
          <span className="price">
            <span className="price__now">{formatINR(variant.price)}</span>
            {variant.mrp && <span className="price__was">{formatINR(variant.mrp)}</span>}
          </span>
          <button
            type="button"
            className={`add-btn ${added ? 'is-added' : ''}`}
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? <CheckIcon aria-hidden="true" /> : <PlusIcon aria-hidden="true" />}
          </button>
        </div>
      </div>
    </article>
  )
}
