import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import ProductCard from '../components/ProductCard'
import { AlertIcon, ChevronDown, CloseIcon, SearchIcon } from '../components/icons'

const SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'name', label: 'Alphabetical' },
]

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || 'all'
  const search = params.get('search') || ''
  const sort = params.get('sort') || 'featured'

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setErr(null)
    api
      .getProducts({ category, search, sort })
      .then((data) => alive && setProducts(data))
      .catch((e) => alive && setErr(e.message))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [category, search, sort])

  const patch = (next) => {
    const merged = { category, search, sort, ...next }
    const clean = {}
    Object.entries(merged).forEach(([k, v]) => {
      if (v && !(k === 'category' && v === 'all') && !(k === 'sort' && v === 'featured')) {
        clean[k] = v
      }
    })
    setParams(clean, { replace: true })
  }

  const activeCat = categories.find((c) => c.key === category)
  const heading = search
    ? `Results for “${search}”`
    : activeCat && activeCat.key !== 'all'
      ? activeCat.name
      : 'All Products'

  return (
    <div className="shop">
      <div className="shop__hero">
        <span className="eyebrow">Our full pantry</span>
        <h1>{heading}</h1>
        <p>Chemical-free staples, hand-made in small batches and lab-tested for purity.</p>
      </div>

      <div className="shop__toolbar">
        <div className="chips" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c.key}
              className={`chip ${category === c.key ? 'is-active' : ''}`}
              onClick={() => patch({ category: c.key })}
            >
              {c.name}
              <span className="chip__count">{c.count}</span>
            </button>
          ))}
        </div>
        <label className="sort">
          <span>Sort</span>
          <div className="sort__field">
            <select value={sort} onChange={(e) => patch({ sort: e.target.value })}>
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <ChevronDown />
          </div>
        </label>
      </div>

      {search && (
        <button className="clear-search" onClick={() => patch({ search: '' })}>
          <CloseIcon /> Clear search
        </button>
      )}

      {loading ? (
        <div className="grid" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="card card--skeleton" key={i} />
          ))}
        </div>
      ) : err ? (
        <div className="empty-state">
          <div className="empty-state__mark">
            <AlertIcon />
          </div>
          <h3>Couldn't load the catalogue</h3>
          <p className="muted">{err}</p>
          <p className="muted">Make sure the backend is running on port 8001.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__mark">
            <SearchIcon />
          </div>
          <h3>No products found</h3>
          <p className="muted">Try a different category or search term.</p>
          <button className="btn btn--primary" onClick={() => setParams({}, { replace: true })}>
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <p className="shop__count">{products.length} products</p>
          <div className="grid">
            {products.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
