import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { CATEGORY_META, THEMES } from '../data/catalogMeta'
import ProductCard from '../components/ProductCard'
import { ArrowRight } from '../components/icons'

const VALUES = [
  { icon: '🌿', title: 'Chemical-Free', text: 'No pesticides, no preservatives, no shortcuts — ever.' },
  { icon: '🐄', title: 'Bilona Method', text: 'A2 ghee hand-churned from cultured curd, the ancient way.' },
  { icon: '🔬', title: 'Lab-Tested', text: 'Every batch is third-party tested for purity you can trust.' },
  { icon: '🚚', title: 'Farm-to-Kitchen', text: 'Small batches, sourced direct, shipped fresh across India.' },
]

const STEPS = [
  { n: '01', title: 'Sourced with intent', text: 'We partner with small farms that never touch synthetic chemicals.' },
  { n: '02', title: 'Made the slow way', text: 'Cold-pressed, hand-milled, wood-churned — traditional methods, no heat damage.' },
  { n: '03', title: 'Tested & sealed', text: 'Lab-verified for purity, then sealed fresh to lock in nutrition.' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    let alive = true
    api.getProducts({ sort: 'featured' }).then((all) => {
      if (alive) setFeatured(all.filter((p) => p.featured).slice(0, 8))
    }).catch(() => {})
    api.getCategories().then((c) => {
      if (alive) setCategories(c.filter((x) => x.key !== 'all'))
    }).catch(() => {})
    return () => { alive = false }
  }, [])

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__bg" aria-hidden="true" />
        <div className="hero__inner">
          <div className="hero__copy">
            <span className="eyebrow">🌾 Pure. Traditional. Chemical-Free.</span>
            <h1>
              Staples from the farm,<br />
              <em>the way nature intended.</em>
            </h1>
            <p>
              Bilona ghee, raw honey, cold-pressed oils and hand-milled grains — sourced from
              small Indian farms and delivered fresh to your kitchen. No chemicals. No compromise.
            </p>
            <div className="hero__cta">
              <Link to="/shop" className="btn btn--primary btn--lg">
                Shop all staples <ArrowRight />
              </Link>
              <a href="#story" className="btn btn--ghost btn--lg">Our story</a>
            </div>
            <div className="hero__trust">
              <span>⭐ 4.8/5 from 12,000+ families</span>
              <span>•</span>
              <span>🌿 100% Chemical-Free</span>
            </div>
          </div>
          <div className="hero__art" aria-hidden="true">
            <div className="hero__blob hero__blob--1">🫙</div>
            <div className="hero__blob hero__blob--2">🍯</div>
            <div className="hero__blob hero__blob--3">🌻</div>
            <div className="hero__blob hero__blob--4">🌾</div>
          </div>
        </div>
      </section>

      <section className="values">
        {VALUES.map((v) => (
          <div className="value" key={v.title}>
            <span className="value__icon">{v.icon}</span>
            <h3>{v.title}</h3>
            <p>{v.text}</p>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <span className="eyebrow">Shop by category</span>
            <h2>Find your daily essentials</h2>
          </div>
          <Link to="/shop" className="link-arrow">
            View all <ArrowRight />
          </Link>
        </div>
        <div className="cat-grid">
          {categories.map((c) => {
            const meta = CATEGORY_META[c.name] || {}
            return (
              <Link
                to={`/shop?category=${c.key}`}
                className="cat-card"
                key={c.key}
                style={{ background: THEMES[meta.theme] || THEMES.combo }}
              >
                <span className="cat-card__emoji">{meta.emoji || '🌿'}</span>
                <span className="cat-card__name">{c.name}</span>
                <span className="cat-card__count">{c.count} products</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="section section--tint">
        <div className="section__head">
          <div>
            <span className="eyebrow">Loved by our customers</span>
            <h2>Bestsellers &amp; new arrivals</h2>
          </div>
          <Link to="/shop" className="link-arrow">
            Shop all <ArrowRight />
          </Link>
        </div>
        <div className="grid">
          {featured.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
          {featured.length === 0 && <p className="muted">Loading fresh picks…</p>}
        </div>
      </section>

      <section className="story" id="story">
        <div className="story__inner">
          <div className="story__media" aria-hidden="true">
            <div className="story__circle">🌾</div>
          </div>
          <div className="story__copy">
            <span className="eyebrow">Our story</span>
            <h2>Shoonya means zero — zero chemicals, zero shortcuts.</h2>
            <p>
              We started Shoonya Farms with a simple belief: the food that nourishes us shouldn't
              come at the cost of our health or our land. So we went back to the source — small
              farms, traditional methods, and an obsession with purity.
            </p>
            <div className="story__steps">
              {STEPS.map((s) => (
                <div className="story__step" key={s.n}>
                  <span className="story__n">{s.n}</span>
                  <div>
                    <h4>{s.title}</h4>
                    <p>{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/shop" className="btn btn--primary">
              Taste the difference <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-band__inner">
          <h2>Real food, delivered with care.</h2>
          <p>Join thousands of families who've made the switch to chemical-free staples.</p>
          <Link to="/shop" className="btn btn--amber btn--lg">
            Start shopping <ArrowRight />
          </Link>
        </div>
      </section>
    </div>
  )
}
